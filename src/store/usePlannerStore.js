import { create } from 'zustand';
import { mockCourses } from '../data/mockCourses';

const YEARS = 4;
const QUARTERS = ['Fall', 'Winter', 'Spring', 'Summer'];

// Initialize empty planner structure
const initialPlanner = {};
for (let y = 1; y <= YEARS; y++) {
  QUARTERS.forEach(q => {
    initialPlanner[`year-${y}-${q.toLowerCase()}`] = [];
  });
}

export const usePlannerStore = create((set) => ({
  planner: initialPlanner,
  availableCourses: mockCourses,
  isAllExpanded: false,

  toggleExpandAll: () => set((state) => ({ isAllExpanded: !state.isAllExpanded })),

  moveCourse: (sourceId, destinationId, sourceIndex, destIndex, courseId) => set((state) => {
    // Prevent duplicate in the same quarter
    if (destinationId !== 'sidebar' && sourceId !== destinationId) {
      const destList = state.planner[destinationId] || [];
      if (destList.some(c => c.id === courseId)) {
        return state; // Drop is canceled, course bounces back
      }
    }

    const newPlanner = { ...state.planner };
    const newAvailable = [...state.availableCourses];

    let movedCourse;

    // Remove from source list
    if (sourceId === 'sidebar') {
      // Find course in availableCourses
      movedCourse = newAvailable.find(c => c.id === courseId);
    } else {
      const sourceList = Array.from(newPlanner[sourceId]);
      movedCourse = sourceList[sourceIndex];
      sourceList.splice(sourceIndex, 1);
      newPlanner[sourceId] = sourceList;
    }

    // Add to destination list
    if (destinationId === 'sidebar') {
      // For now, if dragged to sidebar, just don't add back to array unless we want it fully removed from planner
      // We don't remove from sidebar when adding to planner, so availableCourses remains full list.
    } else {
      const destList = Array.from(newPlanner[destinationId] || []);
      destList.splice(destIndex, 0, movedCourse);
      newPlanner[destinationId] = destList;
    }

    return { planner: newPlanner };
  }),

  removeCourseFromPlanner: (quarterId, courseIndex) => set((state) => {
    const newPlanner = { ...state.planner };
    const list = Array.from(newPlanner[quarterId]);
    list.splice(courseIndex, 1);
    newPlanner[quarterId] = list;
    return { planner: newPlanner };
  })
}));
