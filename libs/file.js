function load(input) {
  var file = input.files[0];
  var reader = new FileReader();
  reader.readAsText(file);

  reader.onload = function() {
    var inputArea = document.getElementById('inputArea');
    inputArea.value = reader.result;
  };
  document.getElementById('load').value = '';
}