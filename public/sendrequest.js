async function sendRequest(method, url, body = null) {
  const headers = {
    "Content-Type": "application/json",
  };
  document.getElementById("status_indicator").style.backgroundColor = "yellow";

  try {
    let params;
    if (body) {
      params = { method: method, body: JSON.stringify(body), headers: headers };
    } else {
      params = { method: method, headers: headers };
    }
    return fetch(url, params).then((response) => {
      if (response.ok) {
        document.getElementById("status_indicator").style.backgroundColor =
          "green";
        console.log(response);
        return response;
      }
    });
  } catch (e) {
    console.log(e);
  }
}
