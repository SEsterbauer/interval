function request(options) {
  const method = options.method || 'GET';
  if (options.data && method === 'GET') {
    options.url += typeof options.data === 'string' ? `?${options.data}` : `?${createQueryString(options.data)}`;
  }
  const http = new XMLHttpRequest();
  http.onreadystatechange = () => {
    if (http.readyState === 4) {
      if (http.status !== 200) {
        console.error('Error on request to', options.url, ':', http.statusText);
        return;
      }
      console.log('Request to', options.url, 'ok. Received:', http.responseText);
      if (options.callback) options.callback(http.responseText);
    }
  };
  http.onerror = (error) => {
    console.error('Error on request to', options.url, ':', error);
  };
  http.open(method, options.url || '/', true);
  if (options.headers) {
    Object.keys(options.headers).forEach(header => {
      http.setRequestHeader(header, options.headers[header]);
    });
  }
  console.log(method, 'to', options.url,  options.data ? 'with data: ' + JSON.stringify(options.data) : '');
  http.send(method === 'POST' && options.data && typeof options.data === 'object' ? JSON.stringify(options.data) : null);
}
