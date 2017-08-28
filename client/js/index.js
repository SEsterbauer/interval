const storageContainer = document.getElementById('storageContainer');
const inputElementContainer = document.getElementById('inputElementContainer');
const submitDataButton = document.getElementById('submitData');
const queueContainer = document.getElementById('queueContainer');
const queueCounter = document.getElementById('queueCounter');
const errorContainer = document.getElementById('errorContainer');

const sessionId = 1; // todo implement sessionIds smartly

function appendStorageElement(container, data) {
  const historyElement = document.createElement('div');
  Object.keys(data).forEach(key => {
    const historyTextElement = document.createElement('p');
    historyTextElement.innerHTML = `${capitalize(key)}: ${data[key]}`;
    historyElement.appendChild(historyTextElement);
    addClassToElement(historyElement, 'storageElement');
  });
  container.appendChild(historyElement);
}

// requests an update of the displayed storage
function updateStorage(callback) {
  request({
    url: '/storage',
    data: { sessionId },
    callback: (storage) => {
      if (typeof storage === 'string') storage = JSON.parse(storage);
      storageContainer.innerHTML = '';
      storage.forEach(storageItem => {
        appendStorageElement(storageContainer, storageItem.names.reduce((value, name, index) => {
          value[name] = storageItem.values[index];
          return value;
        }, {}));
      });
      if (typeof callback === 'function') callback(storage);
    },
  });
}

// request an event stream from the server, show UI elements containing data on ticks
function startInterval() {
  if (!window.EventSource) {
    renderError(errorContainer, 'The version of your browser is not supported by this application yet. Please upgrade your browser.');
  }
  const source = new EventSource(`/interval?${createQueryString({
    tickSecond: 5,
    period: 10,
    sessionId,
  })}`);
  source.addEventListener('open', (e) => {
    console.log('opened stream:', e.target.url);
  }, false);
  source.addEventListener('message', (e) => {
    console.log('received stream data:', e.data);
  }, false);
  source.addEventListener('tick', (e) => {
    console.log('received tick data:', e.data);
    queueCounter.innerHTML = parseInt(queueCounter.innerHTML) + 1 || 1;
    const element = document.createElement('div');
    addClassToElement(element, 'queueElement');
    element.innerHTML = 'Add updated values';
    queueContainer.appendChild(element);
    submitDataButton.disabled = false;
  }, false);
  source.addEventListener('error', (e) => {
    if (e.readyState === 3) {
      console.log('closed stream:', e.data);
      return;
    }
    console.error('error while streaming:', JSON.stringify(e)); // todo look for error message property
  }, false);
}

updateStorage();
startInterval();

// append rows of input fields onkeydown on the last row of input fields
inputElementContainer.onkeydown = (event) => {
  const lastChildElement = getLastChildElementWithClassName(inputElementContainer, event.target.className);
  if (event.target === lastChildElement) {
    const nameInputLabel = document.createTextNode('Entity: ');
    inputElementContainer.appendChild(nameInputLabel);

    const nameInputElement = document.createElement('input');
    nameInputElement.type = 'text';
    addClassToElement(nameInputElement, 'recordName');
    inputElementContainer.appendChild(nameInputElement);

    const valueInputLabel = document.createTextNode(' Value: ');
    inputElementContainer.appendChild(valueInputLabel);

    const valueInputElement = document.createElement('input');
    valueInputElement.type = 'text';
    addClassToElement(valueInputElement, 'recordValue');
    inputElementContainer.appendChild(valueInputElement);

    const lineBreakElement = document.createElement('br');
    inputElementContainer.appendChild(lineBreakElement);
  }
};

// submit data of text input elements as sets per row
submitDataButton.onclick = () => {
  errorContainer.innerHTML = '';
  // require both input fields in a row to be filled if at least one is filled
  const childElements = Array.from(inputElementContainer.childNodes);
  const names = childElements
    .filter(node => node.className === 'recordName')
    .map(node => node.value);
  const values = childElements
    .filter(node => node.className === 'recordValue')
    .map(node => node.value);
  const filteredNames = names.filter((name, index) => {
    if (!name && values[index]) {
      renderError(errorContainer, 'Names for entities are required!');
      return false;
    }
    return name && values[index];
  });
  const filteredValues = values.filter((value, index) => {
    if (!value && names[index]) {
      renderError(errorContainer, 'Values for entities are required!');
      return false;
    }
    return value && names[index];
  });
  if (
    filteredNames.length !== filteredValues.length ||
    !filteredNames.length
  ) {
    return;
  }
  const data = filteredNames.reduce((value, name, index) => {
    value[name] = filteredValues[index];
    return value;
  }, {});
  data.sessionId = sessionId;
  request({
    url: '/data',
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    data,
    callback: () => {
      updateStorage((data) => {
        const counter = parseInt(queueCounter.innerHTML);
        if (!(counter - 1)) {
          submitDataButton.disabled = true;
        }
        queueCounter.innerHTML = counter - 1;
        if (queueContainer.lastChild.id === 'queueCounter') {
          return;
        }
        queueContainer.removeChild(queueContainer.lastChild);
      });
    },
  });
};
