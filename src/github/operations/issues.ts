import { z } from "zod";
import { githubRequest, buildUrl } from "../common/utils.js";

// Note: Issue types, sub-issues, and advanced issue search are currently in public preview.
// See: https://docs.github.com/rest/issues/issues#sub-issues-custom-type-preview-notices

export const ListSubIssuesSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  issue_number: z.number(),
  per_page: z.number().optional(),
  page: z.number().optional(),
});

export const AddSubIssueSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  issue_number: z.number(),
  sub_issue_id: z.number(),
  replace_parent: z.boolean().optional(),
});

export const RemoveSubIssueSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  issue_number: z.number(),
  sub_issue_id: z.number(),
});

export const GetIssueSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  issue_number: z.number(),
});

export const IssueCommentSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  issue_number: z.number(),
  body: z.string(),
});

export const CreateIssueOptionsSchema = z.object({
  title: z.string(),
  body: z.string().optional(),
  assignees: z.array(z.string()).optional(),
  milestone: z.number().optional(),
  labels: z.array(z.string()).optional(),
});

export const CreateIssueSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  ...CreateIssueOptionsSchema.shape,
});

export const ListIssuesOptionsSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  direction: z.enum(["asc", "desc"]).optional(),
  labels: z.array(z.string()).optional(),
  page: z.number().optional(),
  per_page: z.number().optional(),
  since: z.string().optional(),
  sort: z.enum(["created", "updated", "comments"]).optional(),
  state: z.enum(["open", "closed", "all"]).optional(),
});

export const UpdateIssueOptionsSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  issue_number: z.number(),
  title: z.string().optional(),
  body: z.string().optional(),
  assignees: z.array(z.string()).optional(),
  milestone: z.number().optional(),
  labels: z.array(z.string()).optional(),
  state: z.enum(["open", "closed"]).optional(),
});

export async function getIssue(
  owner: string,
  repo: string,
  issue_number: number
) {
  return githubRequest(
    `https://api.github.com/repos/${owner}/${repo}/issues/${issue_number}`
  );
}

export async function addIssueComment(
  owner: string,
  repo: string,
  issue_number: number,
  body: string
) {
  return githubRequest(
    `https://api.github.com/repos/${owner}/${repo}/issues/${issue_number}/comments`,
    {
      method: "POST",
      body: { body },
    }
  );
}

export async function createIssue(
  owner: string,
  repo: string,
  options: z.infer<typeof CreateIssueOptionsSchema>
) {
  return githubRequest(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    method: "POST",
    body: options,
  });
}

export async function listIssues(
  owner: string,
  repo: string,
  options: Omit<z.infer<typeof ListIssuesOptionsSchema>, "owner" | "repo">
) {
  const urlParams: Record<string, string | undefined> = {
    direction: options.direction,
    labels: options.labels?.join(","),
    page: options.page?.toString(),
    per_page: options.per_page?.toString(),
    since: options.since,
    sort: options.sort,
    state: options.state,
  };

  return githubRequest(
    buildUrl(`https://api.github.com/repos/${owner}/${repo}/issues`, urlParams)
  );
}

export async function updateIssue(
  owner: string,
  repo: string,
  issue_number: number,
  options: Omit<
    z.infer<typeof UpdateIssueOptionsSchema>,
    "owner" | "repo" | "issue_number"
  >
) {
  return githubRequest(
    `https://api.github.com/repos/${owner}/${repo}/issues/${issue_number}`,
    {
      method: "PATCH",
      body: options,
    }
  );
}

/**
 * List sub-issues for a given issue.
 * Note: This endpoint requires 'Issues' repository read permission.
 * For public repositories, this endpoint can be used without authentication.
 *
 * @param owner Repository owner
 * @param repo Repository name
 * @param issue_number Issue number to list sub-issues for
 * @param options Pagination options
 * @returns Array of sub-issues with full issue details
 */
export async function listSubIssues(
  owner: string,
  repo: string,
  issue_number: number,
  options?: { per_page?: number; page?: number }
) {
  const urlParams: Record<string, string | undefined> = {
    per_page: options?.per_page?.toString(),
    page: options?.page?.toString(),
  };
  return githubRequest(
    buildUrl(
      `https://api.github.com/repos/${owner}/${repo}/issues/${issue_number}/sub_issues`,
      urlParams
    )
  );
}

/**
 * Add a sub-issue to an issue.
 * Note: This endpoint requires 'Issues' repository write permission.
 * Creating content too quickly using this endpoint may result in secondary rate limiting.
 *
 * @param owner Repository owner
 * @param repo Repository name
 * @param issue_number Issue number to add sub-issue to
 * @param sub_issue_id ID of the issue to add as a sub-issue (must belong to same repository)
 * @param replace_parent Whether to replace the sub-issue's current parent
 * @returns Updated issue details
 */
export async function addSubIssue(
  owner: string,
  repo: string,
  issue_number: number,
  sub_issue_id: number,
  replace_parent?: boolean
) {
  return githubRequest(
    `https://api.github.com/repos/${owner}/${repo}/issues/${issue_number}/sub_issues`,
    {
      method: "POST",
      body: { sub_issue_id, replace_parent },
    }
  );
}

/**
 * Remove a sub-issue from an issue.
 * Note: This endpoint requires 'Issues' repository write permission.
 * Removing content too quickly using this endpoint may result in secondary rate limiting.
 *
 * @param owner Repository owner
 * @param repo Repository name
 * @param issue_number Issue number to remove sub-issue from
 * @param sub_issue_id ID of the sub-issue to remove
 * @returns Updated issue details
 */
export async function removeSubIssue(
  owner: string,
  repo: string,
  issue_number: number,
  sub_issue_id: number
) {
  return githubRequest(
    `https://api.github.com/repos/${owner}/${repo}/issues/${issue_number}/sub_issue`,
    {
      method: "DELETE",
      body: { sub_issue_id },
    }
  );
}
