export declare const imageTypes: string[];
export declare const assetTypes: string[];
export declare class Properties {
    [key: string]: string;
}
export interface VideoIdentifier {
    service: string;
    id: string;
}
export interface VideoIdentifiers {
    videoid: string;
    videoIds: VideoIdentifier[];
}
export interface IconType {
    type: string;
    color: string;
}
export interface LearningResource {
    courseRoot: string;
    route: string;
    id: string;
    lrs: LearningResource[];
    files: Array<string>;
    type: string;
}
export interface LabStep {
    title: string;
    shortTitle: string;
    contentMd: string;
    contentHtml: string;
    route: string;
    id: string;
    type: string;
    hide: boolean;
}
export interface LearningObject {
    parentLo?: LearningObject;
    id: string;
    route: string;
    type: string;
    title: string;
    summary: string;
    img: string;
    imgFile: string;
    pdf: string;
    pdfFile: string;
    icon: IconType;
    contentMd: string;
    contentHtml: string;
    video: string;
    videoids: VideoIdentifiers;
    frontMatter: Properties;
    los: Array<LearningObject | LabStep>;
    properties?: Properties;
    calendar?: Properties;
    hide: boolean;
    panels?: any;
    units?: any;
    sides?: any;
    standardLos?: any;
}
export declare const loTypes: string[];
export declare const preOrder: Map<string, number>;
