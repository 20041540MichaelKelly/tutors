#!/usr/bin/env node
import * as fs from "fs";
import { resourceBuilder } from "tutors-gen-lib/src/lo/resource-builder";
import { courseBuilder } from "tutors-gen-lib/src/lo/course-builder";
import { writeFile } from "tutors-gen-lib/src/utils/utils";
import * as nunjucks from "nunjucks";
import { courseBuilderHtml } from "./controllers/html-emitter";

const version = `tutors-html: 2.6.2 (tutors-lib: 2.6.2)`;

const root = __dirname;
nunjucks.configure(root + "/views", { autoescape: false });
nunjucks.installJinjaCompat();

if (fs.existsSync("course.md")) {
  const srcFolder = process.cwd();
  const destFolder = `${srcFolder}/html`;
  console.log(`Static course generator ${version}`);
  resourceBuilder.buildTree(srcFolder);
  courseBuilder.buildCourse(resourceBuilder.lr);
  resourceBuilder.copyAssets(destFolder);
  writeFile(destFolder, "tutors.json", JSON.stringify(courseBuilder.lo));
  courseBuilderHtml.generateCourse(destFolder, courseBuilder.lo)
  console.log(`${version}`);
} else {
  console.log("Cannot locate course.md. Change to course folder and try again. ");
}
