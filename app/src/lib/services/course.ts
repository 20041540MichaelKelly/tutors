import { courseUrl, currentCourse, currentLo, week } from "$lib/stores";
import type { Lo, Course, Lab } from "$lib/services/models/lo-types";
import { decorateCourseTree } from "./models/lo-tree";
import { LiveLab } from "./models/live-lab";

export const courseService = {
  courses: new Map<string, Course>(),
  courseUrl: "",

  async getOrLoadCourse(courseId: string, fetchFunction: typeof fetch): Promise<Course> {
    let course = this.courses.get(courseId);
    let courseUrl = courseId;

    if (!course) {
      if (!courseId.includes(".netlify.app") && !courseId.includes(".tutors.dev")) {
        courseUrl = `${courseId}.netlify.app`;
      } else {
        courseId = courseId.split(".")[0];
      }

      try {
        const response = await fetchFunction(`https://${courseUrl}/tutors.json`);
        if (!response.ok) {
          throw new Error(`Fetch failed with status ${response.status}`);
        }
        const data = await response.json();
        course = data as Course;
        decorateCourseTree(course, courseId, courseUrl);
        this.courses.set(courseId, course);
      } catch (error) {
        console.error(`Error fetching from URL: https://${courseUrl}/tutors.json`);
        console.error(error);
        throw error;
      }
    }

    return course;
  },

  async readCourse(courseId: string, fetchFunction: typeof fetch): Promise<Course> {
    const course = await this.getOrLoadCourse(courseId, fetchFunction);
    currentCourse.set(course);
    currentLo.set(course);
    courseUrl.set(course.courseUrl);
    //week.set(course?.currentWeek);
    //this.course = course;
    return course;
  },

  async readTopic(courseId: string, topicId: string, fetchFunction: typeof fetch): Promise<Lo> {
    const course = await this.readCourse(courseId, fetchFunction);
    const topic = course.loIndex.get(topicId);
    if (topic) currentLo.set(topic);
    return topic!;
  },

  async readLab(courseId: string, labId: string, fetchFunction: typeof fetch): Promise<LiveLab> {
    const course = await this.readCourse(courseId, fetchFunction);

    const lastSegment = labId.substring(labId.lastIndexOf("/") + 1);
    if (!lastSegment.startsWith("book")) {
      labId = labId.slice(0, labId.lastIndexOf("/"));
    }

    const lab = course.loIndex.get(labId) as Lab;
    const liveLab = new LiveLab(course, lab, labId);


    currentLo.set(lab);
    return liveLab;
  },

  async readWall(courseId: string, type: string, fetchFunction: typeof fetch): Promise<Lo[]> {
    const course = await this.readCourse(courseId, fetchFunction);
    const wall = course.wallMap?.get(type);
    return wall!;
  },

  async readLo(courseId: string, loId: string, fetchFunction: typeof fetch): Promise<Lo> {
    const course = await this.readCourse(courseId, fetchFunction);
    const lo = course.loIndex.get(loId);
    if (lo) currentLo.set(lo);
    return lo!;
  }
};
