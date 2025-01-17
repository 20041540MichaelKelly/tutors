import { isCompositeLo, type Course, type IconType, type Lo, type Panels, Composite, LoType, Lab } from "./lo-types";
import { convertMdToHtml } from "./markdown-utils";
import { createCompanions, filterByType, flattenLos, injectCourseUrl } from "./lo-utils";

let rootCourse: Course;

export function decorateCourseTree(course: Course, courseId: string = "", courseUrl = "") {
  rootCourse = course;
  course.courseId = courseId;
  course.courseUrl = courseUrl;
  course.walls = [];
  ["talk", "note", "lab", "web", "archive", "github"].forEach((type) => addWall(rootCourse, type as LoType));
  decorateLoTree(course);
  injectCourseUrl(course, courseId, courseUrl);
  const los = flattenLos(course.los);
  course.loIndex = new Map<string, Lo>();
  los.forEach((lo) => course.loIndex.set(lo.route, lo));
  createCompanions(course);
  course.isPortflio = course.properties.portfolio === "true";
  course.areVideosHidden = course.properties.hideVideos !== "false";
  course.areLabStepsAutoNumbered = course.properties.labStepsAutoNumber !== "false";
  course.hasEnrollment = false;
  course.hasWhiteList = false;
}

export function decorateLoTree(lo: Lo) {
  let imgPrefix = "";
  if (lo.type === "panelnote") {
    imgPrefix = lo.id;
  }
  lo.contentHtml = convertMdToHtml(lo?.contentMd, imgPrefix);
  lo.summary = convertMdToHtml(lo?.summary);
  lo.icon = getIcon(lo);
  lo.parentCourse = rootCourse;
  lo.breadCrumbs = [];
  crumbs(lo, lo.breadCrumbs);
  if (lo.type == "lab") {
    const lab = lo as Lab;
    lab.los.forEach((step) => {
      step.contentHtml = convertMdToHtml(step?.contentMd);
    });
  }
  if (isCompositeLo(lo)) {
    const compositeLo = lo as Composite;
    if (compositeLo.los) {
      compositeLo.panels = getPanels(compositeLo.los);
      compositeLo.units = getUnits(compositeLo.los);
      for (const childLo of compositeLo.los) {
        childLo.parentLo = lo;
        if (compositeLo.los) {
          decorateLoTree(childLo);
        }
      }
    }
  }
}

export function isPortfolio(course: Course) {
  return course.properties?.portfolio;
}

function getPanels(los: Lo[]): Panels {
  return {
    panelVideos: los?.filter((lo) => lo.type === "panelvideo"),
    panelTalks: los?.filter((lo) => lo.type === "paneltalk"),
    panelNotes: los?.filter((lo) => lo.type === "panelnote"),
  };
}

function getUnits(los: Lo[]) {
  let standardLos = los?.filter((lo) => lo.type !== "unit" && lo.type !== "panelvideo" && lo.type !== "paneltalk" && lo.type !== "panelnote" && lo.type !== "side");
  standardLos = sortLos(standardLos);
  return {
    units: los?.filter((lo) => lo.type === "unit"),
    sides: los?.filter((lo) => lo.type === "side"),
    standardLos: standardLos,
  };
}

function sortLos(los: Array<Lo>): Lo[] {
  const orderedLos = los.filter((lo) => lo.frontMatter?.order);
  const unOrderedLos = los.filter((lo) => !lo.frontMatter?.order);
  orderedLos.sort((a: any, b: any) => a.frontMatter.order - b.frontMatter.order);
  return orderedLos.concat(unOrderedLos);
}

function getIcon(lo: Lo): IconType | undefined {
  if (lo.frontMatter && lo.frontMatter.icon) {
    return {
      // @ts-ignore
      type: lo.frontMatter.icon["type"],
      // @ts-ignore
      color: lo.frontMatter.icon["color"],
    };
  }
  return undefined;
}

function crumbs(lo: Lo | undefined, los: Lo[]) {
  if (lo) {
    crumbs(lo.parentLo, los);
    los.push(lo);
  }
}

function addWall(course: Course, type: LoType) {
  const los = filterByType(course.los, type);
  if (los.length > 0) {
    course.walls?.push(filterByType(course.los, type));
  }
}
