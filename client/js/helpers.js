function renderError(container, error) {
  const errorElement = document.createElement('div');
  errorElement.innerHTML = error;
  container.appendChild(errorElement);
}

function getLastChildElementWithClassName(container, className) {
  return Array.from(container.childNodes).reduce((value, node) => {
    if (node.className === className) {
      return node;
    }
    return value;
  }, false)
}

function addClassToElement(element, className) {
  if (element.className.indexOf(className) === -1) {
    if (!element.className) {
      element.className = className;
    } else {
      element.className = `${element.className} ${className}`;
    }
  }
}

function createQueryString(params) {
  if (typeof params !== 'object') {
    throw new Error(`createQueryString: params must be an object. Is: ${typeof params}`);
  }
  return Object.keys(params).map(key => {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
  }).join('&');
}

function capitalize(string) {
  if (typeof string !== 'string') {
    throw new Error('capitalize: string must be of type string');
  }
  return `${string[0].toUpperCase()}${string.substr(1).toLowerCase()}`;
}
