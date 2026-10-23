import { AppArtwork } from './common/AppArtwork';
import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useReview } from '../context/ReviewContext';
import {
  ECE_ROADMAP_PREREQUISITES,
  ECE_SUBJECT_FLOW,
  RoadmapNodeData,
  SubjectPrerequisiteFlow,
} from '../data/prerequisiteRoadmapData';
import { computeTopicTier } from '../utils/masteryCalculator';
import { Topic, TopicStatusTier } from '../types';
import { GitBranch, ZoomIn, ZoomOut, Maximize2, Unlock, CheckCircle2, Play, Info, ChevronRight, AlertTriangle } from 'lucide-react';

interface TreeNode {
  id: string;
  name: string;
  shortCode?: string;
  type: 'root' | 'subject' | 'group' | 'topic';
  subjectId?: string;
  subjectName?: string;
  masteryLevel?: number | null;
  statusTier?: TopicStatusTier;
  prerequisiteIds?: string[];
  isLocked?: boolean;
  unmetPrerequisites?: string[];
  boardWeightPercent?: number;
  boardRelevance?: string;
  topicRef?: Topic;
  children?: TreeNode[];
}

export const SubjectRoadmapTree: React.FC = () => {
  const {
    subjects,
    selectedSubjectId,
    setSelectedSubjectId,
    openTopicDrawer,
    startReview,
    allTopics,
    algebraMasteryPercent,
    algebraCoveragePercent,
  } = useReview();

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // View Mode: 'subject_deep_dive' (Topics in current subject) vs 'curriculum_flow' (All 5 subjects macro graph)
  const [viewMode, setViewMode] = useState<'subject_deep_dive' | 'curriculum_flow'>('subject_deep_dive');
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<'All' | 'Foundation' | 'Intermediate' | 'Advanced'>('All');

  // Find current subject object
  const currentSubject = useMemo(() => {
    return subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  }, [subjects, selectedSubjectId]);

  // Merge roadmap metadata with live Topic state from ReviewContext
  const topicMap = useMemo(() => {
    const map = new Map<string, Topic>();
    allTopics.forEach((t) => map.set(t.id, t));
    return map;
  }, [allTopics]);

  // Compute unlock & mastery status for each roadmap node
  const analyzedRoadmapNodes = useMemo(() => {
    return ECE_ROADMAP_PREREQUISITES.map((node) => {
      const liveTopic = topicMap.get(node.canonicalTopicId ?? node.id);
      const mastery = liveTopic?.mastery ?? null;
      const statusTier = liveTopic ? computeTopicTier(liveTopic) : 'Not Started';

      // Check prerequisites
      const unmetPrerequisites: string[] = [];
      node.prerequisiteIds.forEach((prereqId) => {
        const prereqMeta = ECE_ROADMAP_PREREQUISITES.find((p) => p.id === prereqId);
        const prereqLiveTopic = topicMap.get(prereqMeta?.canonicalTopicId ?? prereqId);
        const prereqName = prereqMeta?.name || prereqLiveTopic?.name || prereqId;

        // Prerequisite is met if mastery level is at least 3, or if initialCovered is true
        if (!prereqLiveTopic || (prereqLiveTopic.mastery === null && !prereqLiveTopic.initialCovered) || (prereqLiveTopic.mastery !== null && prereqLiveTopic.mastery < 3)) {
          unmetPrerequisites.push(prereqName);
        }
      });

      const isLocked = unmetPrerequisites.length > 0;

      return {
        ...node,
        liveTopic,
        mastery,
        statusTier,
        unmetPrerequisites,
        isLocked,
      };
    });
  }, [topicMap]);

  // Build hierarchical D3 tree data structure based on viewMode
  const hierarchyData = useMemo<TreeNode>(() => {
    if (viewMode === 'subject_deep_dive') {
      // Filter for nodes belonging to currentSubject
      const subjectNodes = analyzedRoadmapNodes.filter(
        (n) => n.subjectId === selectedSubjectId
      );

      // If filtered by stage
      const filtered = stageFilter === 'All'
        ? subjectNodes
        : subjectNodes.filter((n) => n.stage === stageFilter);

      // Group by groupName or stage
      const groups = d3.group(filtered, (d) => d.groupName || 'Topics');

      const children: TreeNode[] = Array.from(groups.entries()).map(([groupName, items]) => ({
        id: `grp-${groupName}`,
        name: groupName,
        type: 'group',
        children: items.map((item) => ({
          id: item.id,
          name: item.name,
          shortCode: item.shortCode,
          type: 'topic',
          subjectId: item.subjectId,
          subjectName: item.subjectName,
          masteryLevel: item.mastery,
          statusTier: item.statusTier,
          prerequisiteIds: item.prerequisiteIds,
          isLocked: item.isLocked,
          unmetPrerequisites: item.unmetPrerequisites,
          boardWeightPercent: item.boardWeightPercent,
          boardRelevance: item.boardRelevance,
          topicRef: item.liveTopic,
        })),
      }));

      return {
        id: currentSubject.id,
        name: currentSubject.name,
        shortCode: currentSubject.shortCode,
        type: 'subject',
        subjectId: currentSubject.id,
        subjectName: currentSubject.name,
        children: children.length > 0 ? children : undefined,
      };
    } else {
      // 'curriculum_flow': Root -> All 5 subjects with their prerequisite stages
      return {
        id: 'ece-board-licensure',
        name: 'ECE Licensure Board Core',
        shortCode: 'PRC-ECE',
        type: 'root',
        children: ECE_SUBJECT_FLOW.map((subjFlow) => {
          const matchingSubject = subjects.find((s) => s.id === subjFlow.id);
          const subjTopics = analyzedRoadmapNodes.filter((n) => n.subjectId === subjFlow.id);

          return {
            id: subjFlow.id,
            name: subjFlow.name,
            shortCode: subjFlow.shortCode,
            type: 'subject',
            subjectId: subjFlow.id,
            subjectName: subjFlow.name,
            boardWeightPercent: subjFlow.boardWeightPercent,
            children: subjTopics.slice(0, 4).map((t) => ({
              id: t.id,
              name: t.name,
              shortCode: t.shortCode,
              type: 'topic',
              subjectId: t.subjectId,
              subjectName: t.subjectName,
              masteryLevel: t.mastery,
              statusTier: t.statusTier,
              prerequisiteIds: t.prerequisiteIds,
              isLocked: t.isLocked,
              unmetPrerequisites: t.unmetPrerequisites,
              topicRef: t.liveTopic,
            })),
          };
        }),
      };
    }
  }, [viewMode, selectedSubjectId, currentSubject, analyzedRoadmapNodes, stageFilter, subjects]);

  // Setup D3 Tree visualization and Zoom
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 900;
    const height = Math.max(540, container.clientHeight || 540);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', width).attr('height', height).attr('viewBox', [0, 0, width, height]);

    // Defs: Gradients and Markers
    const defs = svg.append('defs');

    // Arrowhead marker for prerequisite flow
    defs
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 8)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto-start-reverse')
      .append('path')
      .attr('d', 'M 0 1.5 L 8 5 L 0 8.5 z')
      .attr('fill', '#78716c');

    const g = svg.append('g').attr('class', 'main-tree-container');

    // D3 Zoom
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoomBehavior);

    // Initial root setup
    const root = d3.hierarchy<TreeNode>(hierarchyData);

    // Tree layout configuration
    const isHorizontal = orientation === 'horizontal';
    const dx = isHorizontal ? 68 : 170;
    const dy = isHorizontal ? 260 : 110;

    const treeLayout = d3.tree<TreeNode>().nodeSize(isHorizontal ? [dx, dy] : [dy, dx]);
    treeLayout(root);

    // Compute bounding box to center the tree initially
    let x0 = Infinity;
    let x1 = -Infinity;
    let y0 = Infinity;
    let y1 = -Infinity;

    root.each((d: any) => {
      const [x, y] = isHorizontal ? [d.y, d.x] : [d.x, d.y];
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    });

    const initialScale = Math.min(0.9, Math.min(width / (x1 - x0 + 160), height / (y1 - y0 + 140)));
    const initialTransform = d3.zoomIdentity
      .translate(
        isHorizontal ? 80 : width / 2 - (x0 + x1) / 2,
        isHorizontal ? height / 2 - (y0 + y1) / 2 : 70
      )
      .scale(initialScale);

    svg.transition().duration(600).call(zoomBehavior.transform, initialTransform);

    // Draw Links with smooth Bezier curves
    const linkGenerator = isHorizontal
      ? d3
          .linkHorizontal<any, any>()
          .x((d) => d.y)
          .y((d) => d.x)
      : d3
          .linkVertical<any, any>()
          .x((d) => d.x)
          .y((d) => d.y);

    const linksGroup = g.append('g').attr('class', 'links');

    linksGroup
      .selectAll('path')
      .data(root.links())
      .join('path')
      .attr('d', linkGenerator as any)
      .attr('fill', 'none')
      .attr('stroke', (d: any) => {
        const targetNode = d.target.data as TreeNode;
        if (targetNode.isLocked) return '#d6d3d1'; // locked: dim gray
        if (targetNode.masteryLevel && targetNode.masteryLevel >= 4) return '#10b981'; // mastered: green
        if (targetNode.masteryLevel && targetNode.masteryLevel >= 2) return '#f59e0b'; // developing: amber
        return '#a8a29e';
      })
      .attr('stroke-width', (d: any) => {
        const targetNode = d.target.data as TreeNode;
        return targetNode.type === 'topic' ? 2 : 2.5;
      })
      .attr('stroke-dasharray', (d: any) => {
        const targetNode = d.target.data as TreeNode;
        return targetNode.isLocked ? '4,4' : 'none';
      })
      .attr('opacity', 0.85);

    // Draw Nodes
    const nodesGroup = g.append('g').attr('class', 'nodes');

    const nodeSelection = nodesGroup
      .selectAll<SVGGElement, d3.HierarchyNode<TreeNode>>('g.node')
      .data(root.descendants())
      .join('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => {
        const [x, y] = isHorizontal ? [d.y, d.x] : [d.x, d.y];
        return `translate(${x},${y})`;
      })
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d.data);
      })
      .on('mouseenter', (event, d) => {
        setHoveredNodeId(d.data.id);
      })
      .on('mouseleave', () => {
        setHoveredNodeId(null);
      });

    // Render node cards / bubbles using SVG foreignObject or native SVG elements
    nodeSelection.each(function (d) {
      const nodeEl = d3.select(this);
      const data = d.data;

      if (data.type === 'root') {
        // Root Exam Core
        nodeEl
          .append('rect')
          .attr('x', -85)
          .attr('y', -24)
          .attr('width', 170)
          .attr('height', 48)
          .attr('rx', 12)
          .attr('fill', '#1c1917')
          .attr('stroke', '#d97706')
          .attr('stroke-width', 2);

        nodeEl
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('y', -3)
          .attr('fill', '#fef3c7')
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .text(data.shortCode || 'CORE');

        nodeEl
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('y', 14)
          .attr('fill', '#fafaf9')
          .attr('font-size', '10px')
          .attr('font-weight', 'medium')
          .text('ECE Licensure Exam');
      } else if (data.type === 'subject') {
        // Subject Node
        const isCurrent = data.id === selectedSubjectId;
        nodeEl
          .append('rect')
          .attr('x', -95)
          .attr('y', -28)
          .attr('width', 190)
          .attr('height', 56)
          .attr('rx', 14)
          .attr('fill', isCurrent ? '#fffbeb' : '#ffffff')
          .attr('stroke', isCurrent ? '#d97706' : '#e7e5e4')
          .attr('stroke-width', isCurrent ? 2.5 : 1.5)
          .attr('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.06))');

        nodeEl
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('y', -8)
          .attr('fill', isCurrent ? '#92400e' : '#1c1917')
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .text(data.shortCode || data.name);

        nodeEl
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('y', 10)
          .attr('fill', '#78716c')
          .attr('font-size', '10px')
          .text(data.name.length > 24 ? data.name.substring(0, 22) + '...' : data.name);

        if (data.boardWeightPercent) {
          nodeEl
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('y', 23)
            .attr('fill', '#b45309')
            .attr('font-size', '9px')
            .attr('font-weight', 'bold')
            .text(`Board Weight: ${data.boardWeightPercent}%`);
        }
      } else if (data.type === 'group') {
        // Topic Group Branch
        nodeEl
          .append('rect')
          .attr('x', -70)
          .attr('y', -18)
          .attr('width', 140)
          .attr('height', 36)
          .attr('rx', 8)
          .attr('fill', '#f5f5f4')
          .attr('stroke', '#d6d3d1')
          .attr('stroke-width', 1.5);

        nodeEl
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('y', 4)
          .attr('fill', '#44403c')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .text(data.name);
      } else {
        // Topic Node with Prerequisite & Mastery indicator
        const width = 175;
        const height = 48;
        const isLocked = data.isLocked;
        const mastery = data.masteryLevel;

        let strokeColor = '#e7e5e4';
        let fillColor = '#ffffff';
        let badgeColor = '#f5f5f4';
        let badgeTextColor = '#78716c';
        let badgeLabel = 'L0';

        if (isLocked) {
          strokeColor = '#e7e5e4';
          fillColor = '#fafaf9';
          badgeColor = '#f5f5f4';
          badgeTextColor = '#a8a29e';
          badgeLabel = 'Locked';
        } else if (mastery !== null && mastery !== undefined) {
          if (mastery >= 4) {
            strokeColor = '#10b981';
            fillColor = '#ecfdf5';
            badgeColor = '#d1fae5';
            badgeTextColor = '#065f46';
            badgeLabel = `L${mastery} Mastery`;
          } else if (mastery >= 2) {
            strokeColor = '#f59e0b';
            fillColor = '#fffbeb';
            badgeColor = '#fef3c7';
            badgeTextColor = '#92400e';
            badgeLabel = `L${mastery} Developing`;
          } else {
            strokeColor = '#f43f5e';
            fillColor = '#fff1f2';
            badgeColor = '#ffe4e6';
            badgeTextColor = '#9f1239';
            badgeLabel = `L${mastery} Review`;
          }
        } else {
          badgeLabel = 'New';
        }

        // Card Container
        nodeEl
          .append('rect')
          .attr('x', -width / 2)
          .attr('y', -height / 2)
          .attr('width', width)
          .attr('height', height)
          .attr('rx', 10)
          .attr('fill', fillColor)
          .attr('stroke', strokeColor)
          .attr('stroke-width', 1.5)
          .attr('filter', 'drop-shadow(0 1px 3px rgba(0,0,0,0.05))');

        // Status badge pill in top right
        nodeEl
          .append('rect')
          .attr('x', width / 2 - 64)
          .attr('y', -height / 2 + 5)
          .attr('width', 58)
          .attr('height', 16)
          .attr('rx', 8)
          .attr('fill', badgeColor);

        nodeEl
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('x', width / 2 - 35)
          .attr('y', -height / 2 + 16.5)
          .attr('fill', badgeTextColor)
          .attr('font-size', '8.5px')
          .attr('font-weight', 'bold')
          .text(badgeLabel);

        // Topic Title
        const displayName =
          data.name.length > 20 ? data.name.substring(0, 18) + '...' : data.name;
        nodeEl
          .append('text')
          .attr('x', -width / 2 + 10)
          .attr('y', -height / 2 + 20)
          .attr('fill', isLocked ? '#78716c' : '#1c1917')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .text(displayName);

        // Subtitle / Prereq indicator
        nodeEl
          .append('text')
          .attr('x', -width / 2 + 10)
          .attr('y', -height / 2 + 35)
          .attr('fill', isLocked ? '#ef4444' : '#78716c')
          .attr('font-size', '8.5px')
          .attr('font-weight', isLocked ? 'bold' : 'normal')
          .text(
            isLocked
              ? `Prereq: ${data.unmetPrerequisites?.[0] || 'Pending'}`
              : data.boardRelevance
              ? `Board: ${data.boardRelevance}`
              : 'Prerequisites Met'
          );
      }
    });
  }, [hierarchyData, orientation, selectedSubjectId]);

  // Zoom control helpers
  const handleZoom = (scaleDelta: number) => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, scaleDelta);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !containerRef.current) return;
    const width = containerRef.current.clientWidth || 900;
    const height = containerRef.current.clientHeight || 540;
    const svg = d3.select(svgRef.current);

    const defaultTransform = d3.zoomIdentity
      .translate(orientation === 'horizontal' ? 80 : width / 2, orientation === 'horizontal' ? height / 2 : 80)
      .scale(0.85);

    svg.transition().duration(500).call(d3.zoom<SVGSVGElement, unknown>().transform as any, defaultTransform);
  };

  // Metrics for current view
  const roadmapStats = useMemo(() => {
    const relevant = analyzedRoadmapNodes.filter(
      (n) => viewMode === 'curriculum_flow' || n.subjectId === selectedSubjectId
    );

    let mastered = 0;
    let unlocked = 0;
    let locked = 0;

    relevant.forEach((r) => {
      if (r.isLocked) locked += 1;
      else if (r.mastery !== null && r.mastery >= 4) mastered += 1;
      else unlocked += 1;
    });

    return {
      total: relevant.length,
      mastered,
      unlocked,
      locked,
      masteryRate: relevant.length > 0 ? Math.round((mastered / relevant.length) * 100) : 0,
    };
  }, [analyzedRoadmapNodes, viewMode, selectedSubjectId]);

  return (
    <div id="subject-roadmap-container" className="space-y-4">
      {/* 1. TOP CONTROLS STRIP */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-800 shrink-0">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight flex items-center gap-2">
                <span>Prerequisite &amp; Mastery Roadmap</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 font-mono">
                  D3 Tree
                </span>
              </h2>
              <p className="text-xs text-stone-500">
                Visual branching hierarchy mapping prerequisite sequences, unlock dependencies, and board mastery levels.
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('subject_deep_dive')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'subject_deep_dive'
                  ? 'bg-stone-900 text-amber-400 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <AppArtwork name="book" inline className="w-3.5 h-3.5" />
              <span>{currentSubject.name} Tree</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('curriculum_flow')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'curriculum_flow'
                  ? 'bg-stone-900 text-amber-400 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <AppArtwork name="cards" inline className="w-3.5 h-3.5" />
              <span>All 5 ECE Subjects</span>
            </button>
          </div>
        </div>

        {/* Filters & Canvas Tools */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs">
          {/* Stage filter for topic view */}
          {viewMode === 'subject_deep_dive' && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-stone-500 font-bold uppercase tracking-wider text-[11px] mr-1">
                Stage:
              </span>
              {(['All', 'Foundation', 'Intermediate', 'Advanced'] as const).map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => setStageFilter(stage)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    stageFilter === stage
                      ? 'bg-stone-900 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          )}

          {/* Orientation & Zoom controls */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() =>
                setOrientation(orientation === 'horizontal' ? 'vertical' : 'horizontal')
              }
              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>{orientation === 'horizontal' ? '↔ Horizontal' : '↕ Vertical'}</span>
            </button>

            <div className="h-4 w-px bg-stone-200 mx-1" />

            <button
              type="button"
              onClick={() => handleZoom(1.2)}
              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => handleZoom(0.8)}
              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
              title="Reset & Center Canvas"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS & PREREQUISITE LEGEND STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            <span>Mastered (L4-5)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-mono font-black text-emerald-700">
            {roadmapStats.mastered}{' '}
            <span className="text-xs text-stone-400 font-normal">/ {roadmapStats.total}</span>
          </div>
          <p className="text-[10px] text-stone-500">Board exam ready</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            <span>In Progress</span>
            <AppArtwork name="star" inline className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-mono font-black text-amber-700">
            {roadmapStats.unlocked}
          </div>
          <p className="text-[10px] text-stone-500">Prerequisites cleared</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            <span>Prereqs Pending</span>
            <AppArtwork name="padlock" inline className="w-3.5 h-3.5 text-stone-400" />
          </div>
          <div className="text-xl font-mono font-black text-stone-700">
            {roadmapStats.locked}
          </div>
          <p className="text-[10px] text-stone-500">Complete prior topics</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            <span>Syllabus Cleared</span>
            <AppArtwork name="shield" inline className="w-3.5 h-3.5 text-stone-700" />
          </div>
          <div className="text-xl font-mono font-black text-stone-900">
            {roadmapStats.masteryRate}%
          </div>
          <p className="text-[10px] text-stone-500">Prerequisite progression</p>
        </div>
      </div>

      {/* 3. D3 SVG CANVAS CONTAINER */}
      <div
        ref={containerRef}
        className="relative w-full h-[540px] bg-stone-50/70 border border-stone-200 rounded-2xl overflow-hidden shadow-inner cursor-grab active:cursor-grabbing"
      >
        <svg ref={svgRef} className="w-full h-full block" />

        {/* Canvas overlay instructions */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs border border-stone-200 px-3 py-1.5 rounded-xl shadow-xs text-[11px] font-medium text-stone-600 pointer-events-none flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Click any topic node to inspect details &amp; open practice drawer</span>
        </div>

        {/* Color Legend in bottom right */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs border border-stone-200 p-2.5 rounded-xl shadow-xs text-[10px] text-stone-600 space-y-1">
          <div className="font-bold text-stone-800 uppercase tracking-wider text-[9px] mb-1">
            Legend:
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Mastered (Level 4-5)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Developing (Level 2-3)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Needs Work / Review Due</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
            <span>Locked (Prereqs Incomplete)</span>
          </div>
        </div>
      </div>

      {/* 4. SELECTED NODE DETAIL MODAL / SLIDEOUT */}
      {selectedNode && (
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-md animate-in fade-in duration-150 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-100 text-stone-700">
                  {selectedNode.shortCode || selectedNode.id}
                </span>
                {selectedNode.isLocked ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1 border border-rose-200">
                    <AppArtwork name="padlock" inline className="w-3 h-3" /> Prerequisites Pending
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                    <Unlock className="w-3 h-3" /> Prerequisites Cleared
                  </span>
                )}
                {selectedNode.masteryLevel !== null && selectedNode.masteryLevel !== undefined && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    Mastery: Level {selectedNode.masteryLevel}/5
                  </span>
                )}
              </div>

              <h3 className="text-base font-extrabold text-stone-900">{selectedNode.name}</h3>
              <p className="text-xs text-stone-500">
                {selectedNode.subjectName || currentSubject.name} • {selectedNode.type.toUpperCase()}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {selectedNode.topicRef && (
                <>
                  <button
                    type="button"
                    onClick={() => openTopicDrawer(selectedNode.topicRef!)}
                    className="px-3.5 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <AppArtwork name="book" inline className="w-3.5 h-3.5" />
                    <span>Open Syllabus &amp; Formulas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => startReview(selectedNode.topicRef!, 'Practice Problems')}
                    className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-amber-400" />
                    <span>Practice Drill</span>
                  </button>
                </>
              )}

              {selectedNode.type === 'subject' && selectedNode.subjectId && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubjectId(selectedNode.subjectId!);
                    setViewMode('subject_deep_dive');
                  }}
                  className="px-4 py-1.5 rounded-xl bg-stone-900 text-amber-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Switch Focus to this Subject</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Prerequisite status message if locked */}
          {selectedNode.isLocked && selectedNode.unmetPrerequisites && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Prerequisites Required Before Board Practice:</span>
              </div>
              <p className="text-[11px] text-rose-700">
                To maximize retention efficiency, complete and reach Level 3+ mastery in:{' '}
                <strong>{selectedNode.unmetPrerequisites.join(', ')}</strong>.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
