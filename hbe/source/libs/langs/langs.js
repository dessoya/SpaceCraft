
labels = { };
currentLang = null;

var absentLabel = function(label) {
	return '';
}

var noLangForLabel = function(label) {
	return '';
}

function applyLabels(labels) {
	for(var name in labels) {
		applyLabel(name, labels[name]);
	}
}

function applyLabel(label, langs) {
	labels[label] = langs;
}

function _l(label) {
	if(label in labels) {
		label = labels[label];
		if(currentLang in label) {
			return label[currentLang];
		}
		return noLangForLabel(label);
	}
	return absentLabel(label);
}