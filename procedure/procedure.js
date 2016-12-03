function combine(end1, end2) {
	if(end1.len < end2.len) {
		var tmp = end1;
		end1 = end2;
		end2 = tmp;
	}
	var sign = 1;
	if(!end1.asc) { // var sign = 1 - 2*end1.asc
		sign = -1;
	}
	document.write("<input type='checkbox'></input>");
	if(end1.len != end2.len) {
		document.write("Attach " + end2.id + " to the " + (end1.marker + (end1.len - end2.len) * sign) + "' marker of " + end1.id + ".<br>");
	} else {
		document.write("Attach the ends of " + end1.id + " and " + end2.id + " together.<br>");
	}
	if(end1.len != 0 && end2.len != 0) {
		var sign2 = 1;
		if(!end2.asc) {
			sign2 = -1;
		}
		document.write("<input type='checkbox'></input>");
		document.write("\t\tWrap tape around the " + (end1.marker + end1.len * sign) + "' marker of " + end1.id + ", and the " + (end2.marker + end2.len * sign2) + "' marker of " + end2.id + ".<br>");
	}

	return end1;
}

function traverse(tree) {
	for(var i = 0; i < tree.children.length; i++) {
		tree.ends.push(traverse(tree.children[i]));
	}
	var newend = tree.ends.reduce(combine);
	newend.len += tree.dist;
	return newend;
}
function JSONLoad(data) {
	var lastend = traverse(data);
	document.write("<br>Trunk is finished when the "  + (lastend.marker  + (lastend.len) * (lastend.asc ? 1 : -1)) + "' marker of " + lastend.id + " comes off the reel.<br>");
	document.write("Longest length is " + lastend.len + "'.<br>");
}
