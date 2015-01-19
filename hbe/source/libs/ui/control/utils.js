function mkel(props) {

	var el = document.createElement( props.tag );
	if(props['class']) el.className = props['class'];

	return el;
}
