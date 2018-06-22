module.exports = {
  createAccountTable,
  createUserTable
}

function createAccountTable(results, res){
  // res.send(results)
  res.write("<head>")
  res.write("<link rel=\"icon\" type=\"image/png\" href=\"public/imgs/menuresize.png\">")
  res.write("<link rel=\"stylesheet\" href=\"css/bulma.css\">")
  res.write("</head>")
  res.write("<table class=\"table is-bordered is-striped is-narrow is-hoverable\">")
  res.write("<thead>")
  res.write("<tr>")
  res.write("<th>Name</th>")
  res.write("<th>ID</th>")
  res.write("</tr>");
  res.write("</thead>")
  res.write("<tr>")
  res.write("<tbody>")
  results.records.map((obj) => {
    res.write("<tr><td>" + obj.Name + "</td> <td>" + obj.Id + "</td> </tr>");
  })
  res.write("</table>")
  res.end()
}

function createUserTable(results, res){
  // res.send(results)
  res.write("<head>")
  res.write("<link rel=\"icon\" type=\"image/png\" href=\"public/imgs/menuresize.png\">")
  res.write("<link rel=\"stylesheet\" href=\"css/bulma.css\">")
  res.write("</head>")
  res.write("<table class=\"table is-bordered is-striped is-narrow is-hoverable\">")
  res.write("<thead>")
  res.write("<tr>")
  res.write("<th>ID</th>")
  res.write("<th>Name</th>")
  res.write("</tr>");
  res.write("</thead>")
  res.write("<tr>")
  res.write("<tbody>")
  results.map((obj) => {
    res.write("<tr><td>" + obj.id + "</td> <td>" + obj.name + "</td> </tr>");
  })
  res.write("</table>")
  res.end()
}
