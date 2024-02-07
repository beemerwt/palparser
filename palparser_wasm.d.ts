/* tslint:disable */
/* eslint-disable */
/**
* @param {Uint8Array} buffer
* @param {Map<any, any> | undefined} [types]
* @param {Function | undefined} [progress]
* @returns {any}
*/
export function palFromRaw(buffer: Uint8Array, types?: Map<any, any>, progress?: Function): any;
/**
* @param {Uint8Array} buffer
* @param {Map<any, any> | undefined} [types]
* @param {Function | undefined} [progress]
* @returns {any}
*/
export function deserialize(buffer: Uint8Array, types?: Map<any, any>, progress?: Function): any;
/**
*/
export class CustomFormatData {
  free(): void;
/**
*/
  id: string;
/**
*/
  value: number;
}
/**
*/
export class Header {
  free(): void;
/**
*/
  custom_format: (CustomFormatData)[];
/**
*/
  custom_format_version: number;
/**
*/
  engine_version: string;
/**
*/
  engine_version_build: number;
/**
*/
  engine_version_major: number;
/**
*/
  engine_version_minor: number;
/**
*/
  engine_version_patch: number;
/**
*/
  magic: number;
/**
*/
  package_version: bigint;
/**
*/
  save_game_version: number;
}
/**
* Root struct inside a save file which holds both the Unreal Engine class name and list of properties
*/
export class Root {
  free(): void;
/**
*/
  SaveGameType: string;
/**
*/
  worldSaveData: Map<any, any>;
}
/**
*/
export class Save {
  free(): void;
/**
*/
  extra: Array<any>;
/**
*/
  header: Header;
/**
*/
  root: Root;
}
