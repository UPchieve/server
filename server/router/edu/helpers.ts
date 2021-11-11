import { escape as uri } from 'querystring'
import Express from 'express'

// Return an object containing the `path` and `label` for a given category /
// subcategory link
export function questionsPath(category?: string, subcategory?: string) {
  const query = []

  if (category) {
    query.push(`category=${uri(category)}`)
  }

  if (subcategory) {
    query.push(`subcategory=${uri(subcategory)}`)
  }

  return {
    path: `questions?${query.join('&')}`,
    label: subcategory || category,
  }
}

// Return a function used by templates to determine if the current page is the
// one currently selected on the navbar.
export function isActivePage(req: Express.Request) {
  return (navUrl: string) => {
    return navUrl === req.path ? 'active' : ''
  }
}

// Convert a given path of a front-end-served asset to the correct absolute or
// relative path, based on the given frontEndRoot
export function frontEndPath(
  relativePath: string,
  frontEndRoot?: string
): string {
  if (frontEndRoot) {
    return new URL(relativePath, frontEndRoot).toString()
  } else {
    return relativePath
  }
}
