import assert from 'node:assert/strict';
import {
  PHYSICS_COURSES, PHYSICS_TOS_GROUPS, PHYSICS_LESSONS,
  physicsCourseGroups, physicsLessonsForGroup, physicsCourseItemTotal,
  type PhysicsCognitiveLevel,
} from '../src/features/physics/physicsCurriculum';

const levels:PhysicsCognitiveLevel[] = ['knowledge','comprehension','application','analysis','synthesis'];
assert.equal(PHYSICS_COURSES.length,2);
assert.equal(PHYSICS_TOS_GROUPS.length,8);
const courseIds=new Set(PHYSICS_COURSES.map(c=>c.id));
const groupIds=new Set(PHYSICS_TOS_GROUPS.map(g=>g.id));
const lessonIds=new Set(PHYSICS_LESSONS.map(l=>l.id));
assert.equal(groupIds.size,PHYSICS_TOS_GROUPS.length,'duplicate group IDs');
assert.equal(lessonIds.size,PHYSICS_LESSONS.length,'duplicate lesson IDs');
for(const course of PHYSICS_COURSES){
  assert.ok(courseIds.has(course.id));
  assert.equal(physicsCourseGroups(course.id).length,4,`four topic groups: ${course.id}`);
  assert.equal(physicsCourseItemTotal(course.id),course.officialItems,`TOS item sum: ${course.id}`);
}
assert.equal(physicsCourseItemTotal('geas-physics'),15);
assert.equal(physicsCourseItemTotal('geas-physics2'),10);
for(const group of PHYSICS_TOS_GROUPS){
  assert.ok(courseIds.has(group.courseId),`unknown course ${group.courseId}`);
  assert.equal(levels.reduce((n,key)=>n+group.cognitive[key],0),group.officialItems,`cognitive mismatch: ${group.id}`);
  assert.ok(group.lessonIds.length>0,`empty group: ${group.id}`);
  assert.equal(new Set(group.lessonIds).size,group.lessonIds.length,`repeated lesson: ${group.id}`);
  assert.equal(physicsLessonsForGroup(group).length,group.lessonIds.length,`missing lesson record: ${group.id}`);
  for(const id of group.lessonIds)assert.ok(lessonIds.has(id),`unknown lesson: ${id}`);
}
assert.equal(PHYSICS_LESSONS.filter(l=>l.status!=='planned').length,0,'Batch 1 must not claim completed lessons');
const sharedIds=PHYSICS_LESSONS.filter(l=>new Set(PHYSICS_TOS_GROUPS.filter(g=>g.lessonIds.includes(l.id)).map(g=>g.courseId)).size>1).map(l=>l.id);
assert.ok(sharedIds.length>0,'Physics courses should share foundational lessons');
console.log('PASS Physics Batch 1 registry:',PHYSICS_COURSES.length,'courses,',PHYSICS_TOS_GROUPS.length,'TOS groups,',PHYSICS_LESSONS.length,'planned lesson outlines,',sharedIds.length,'shared foundations');
