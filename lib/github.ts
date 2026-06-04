const GITHUB_TOKEN = process.env.GITHUB_TOKEN!
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'SupremeGoogle'
const GITHUB_REPO = process.env.GITHUB_REPO || 'molodost-bar'
const API_BASE = 'https://api.github.com'

async function githubFetch(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'GitHub API error')
  return json
}

export async function getFileSha(filePath: string): Promise<string | null> {
  try {
    const data = await githubFetch(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`)
    return data.sha
  } catch {
    return null
  }
}

export async function pushFile(filePath: string, content: string, message: string) {
  const sha = await getFileSha(filePath)
  const encodedContent = Buffer.from(content, 'utf-8').toString('base64')

  return githubFetch(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: encodedContent,
      ...(sha ? { sha } : {}),
    }),
  })
}

export async function pushBinaryFile(filePath: string, base64Content: string, message: string) {
  const sha = await getFileSha(filePath)

  return githubFetch(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: base64Content,
      ...(sha ? { sha } : {}),
    }),
  })
}

export async function deleteFile(filePath: string, message: string) {
  const sha = await getFileSha(filePath)
  if (!sha) throw new Error('File not found')

  return githubFetch(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`, {
    method: 'DELETE',
    body: JSON.stringify({ message, sha }),
  })
}
