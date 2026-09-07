import { Env, isProjectId, projectKey, respond } from "./_shared";
import {
  isValidProjectName,
  validateDependencies,
  validateFiles,
} from "../../src/state/validation";
import { FilesPayload, MAX_PROJECT_SIZE } from "../../src/shared/filesContract";

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== "GET")
    return respond(405, { err: "Only GET requests allowed." });

  const id = new URL(request.url).searchParams.get("id");

  if (!id) return respond(400, { err: "ID is required." });

  if (!isProjectId(id)) return respond(400, { err: "Invalid ID." });
  try {
    // Check metadata before downloading an object. This protects the worker
    // if an oversized or externally-created object ever reaches the bucket.
    const metadata = await env.PROJECTS.head(projectKey(id));

    if (!metadata) return respond(404, { err: "Saved project not found." });

    if (metadata.size > MAX_PROJECT_SIZE) {
      return respond(422, {
        err: "Saved project exceeds the remote size limit.",
      });
    }
    const savedData = await env.PROJECTS.get(projectKey(id));

    if (!savedData) return respond(404, { err: "Saved project not found." });

    const payload = (await savedData.json()) as FilesPayload;
    const filesData = validateFiles(payload?.filesData);

    if (!filesData) return respond(422, { err: "Saved project is corrupted." });

    const dependencies = validateDependencies(payload?.dependencies);

    if (!dependencies)
      return respond(422, { err: "Saved project dependencies are corrupted." });

    const projectName =
      payload.projectName === undefined
        ? "Untitled project"
        : payload.projectName;

    if (!isValidProjectName(projectName))
      return respond(422, { err: "Saved project name is corrupted." });

    return respond(200, {
      filesData,
      dependencies,
      projectName,
      version: savedData.etag,
    });
  } catch (error) {
    console.error("Failed to read saved project", error);
    return respond(500, { err: "Internal server error." });
  }
};
