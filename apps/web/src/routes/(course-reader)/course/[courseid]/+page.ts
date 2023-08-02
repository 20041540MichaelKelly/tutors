import { courseService } from '$lib/services/course';
import type { Course } from '$lib/models/course';
import { currentLo } from '$lib/stores';

export const ssr = false;

export const load = async ({ params }) => {
	const course: Course = await courseService.readCourse(params.courseid);

	currentLo.set(course.lo);
	return {
		course,
		lo: course.lo
	};
};
