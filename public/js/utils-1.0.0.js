$.validator.addMethod("advancedFileSupport", function (value, element, param) {
	return (window.File && window.FileReader && window.FormData);
}, $.validator.format("Seu browser não suporta tratamento avançado de arquivos (por favor, utilize o Firefox 13+ ou Google Chrome 21+)"));

$.validator.addMethod("maxFileLengthKiB", function (value, element, param) {
	if (!element.files)
		return false;
	return (!value.length || !element.files.length || !element.files[0] || element.files[0].size <= (param << 10));
}, $.validator.format("O tamanho do arquivo deve ser no máximo {0} KiB"));

$.validator.addMethod("fileExtension", function (value, element, param) {
	if (!element.files)
		return false;
	// Do not use str.endsWith() because a few browsers don't support it...
	return (!value.length || !element.files.length || !element.files[0] || endsWith(element.files[0].name.toLowerCase(), param));
}, $.validator.format("A extensão do arquivo deve ser {0}"));
