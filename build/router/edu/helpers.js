"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.frontEndPath = exports.isActivePage = exports.questionsPath = void 0;
const querystring_1 = require("querystring");
// Return an object containing the `path` and `label` for a given category /
// subcategory link
function questionsPath(category, subcategory) {
    const query = [];
    if (category) {
        query.push(`category=${(0, querystring_1.escape)(category)}`);
    }
    if (subcategory) {
        query.push(`subcategory=${(0, querystring_1.escape)(subcategory)}`);
    }
    return {
        path: `questions?${query.join('&')}`,
        label: subcategory || category,
    };
}
exports.questionsPath = questionsPath;
// Return a function used by templates to determine if the current page is the
// one currently selected on the navbar.
function isActivePage(req) {
    return (navUrl) => {
        return navUrl === req.path ? 'active' : '';
    };
}
exports.isActivePage = isActivePage;
// Convert a given path of a front-end-served asset to the correct absolute or
// relative path, based on the given frontEndRoot
function frontEndPath(relativePath, frontEndRoot) {
    if (frontEndRoot) {
        return new URL(relativePath, frontEndRoot).toString();
    }
    else {
        return relativePath;
    }
}
exports.frontEndPath = frontEndPath;
