var canvas = $("#canvas")[0];
var wrapper = $("#wrapper");
var sidebar = $("#sidebar");
var output = $("#output");
var context = canvas.getContext("2d");

var units = 8; // 1 foot is 4 px
var drop = 20; 
var buttonpadding = 5;
var textheight = 12;

var buttons = [];

var offsetx = 30;
var offsety = 30;

function drawLine(x1, y1, x2, y2) {
	context.beginPath();
	context.moveTo(x1, y1);
	context.lineTo(x2, y2);
	context.stroke();
}

function drawSmooth(x1, y1, x2, y2) {
	context.moveTo(x1, y1);
	var avgx = (x1 + x2)/2;
	context.bezierCurveTo(avgx, y1, avgx, y2, x2, y2);
	context.stroke();
}

function drawText(x, y, font, text) {
	context.font = font;
	context.fillText(text, x, y, 500,15);
}
function drawPoint(x, y, rad) {
	context.beginPath();
	context.moveTo(x,y);
	context.arc(x, y, rad, 0, 2 * Math.PI);
	context.fill();
}

function nodeClick(e) {
	var tree = this.tree;
	selectedTree = tree;
	sidebar.text("");
	if(tree.ends.length > 0) {
		sidebar.append("Wires ending on this node: \n");
		for(var i = 0; i < tree.ends.length; i++) {
			sidebar.append(tree.ends[i].id + "\n");
		}		
	}
	sidebar.append("Wires passing through node: \n");
	for(var i = 0; i < tree.wires.length; i++) {
		var lenMarker = (tree.wires[i].endmarker  - (tree.totalLength) * (tree.wires[i].asc ? 1 : -1)); 
		sidebar.append(tree.wires[i].id + ": " + lenMarker + "'\n");
	}
	sidebar.append("Distance: " + tree.totalLength + "'");
}

var selectedTree = null;

var droplevel = 0;
function drawTree(tree, ox, oy, dy) {
	context.fillStyle = "#000";
	var dx = tree.dist*units;
	drawSmooth(ox, oy - dy, ox + dx, oy);
	drawPoint(ox, oy - dy, 2);
	
	var node = $("<input></input>");
	node.attr({
		"type": "radio",
		"class": "node",
		"name": "node"
	});
	wrapper.append(node);
	node.css({
		"left": ox + dx - node.width()/2,
		"top": oy - node.height()/2
	});
	node[0].tree = tree;
	node.click(nodeClick);
	context.fillStyle = "#000";
	if(tree.dist > 0) {
		drawText(ox + dx/2 + buttonpadding, oy + buttonpadding + textheight, textheight + "px Georgia", tree.dist + "'");
	}
	for(var i = 0; i < tree.ends.length; i++) {
		drawText(ox + dx + buttonpadding, oy + buttonpadding + i * textheight, textheight + "px Georgia", tree.ends[i].id);
	}

	tree.totalLength = (ox + dx - offsetx) / units;
	
	drawPoint(ox+dx, oy, 2);
	
	if(tree.wires == null) {
		tree.wires = [];
	}

	for(var i = 0; i < tree.ends.length; i++) {
		tree.ends[i].endmarker = tree.ends[i].marker + (tree.totalLength) * (tree.ends[i].asc ? 1 : -1);
	}

	for(var i = 0; i < tree.children.length; i++) {
		var tdy = 0;
		context.fillstyle = "#000";
		if(i != 0) {
			droplevel++;
			oy = offsety + droplevel*drop;
			tdy = drop;
			//drawLine(ox + dx, py, ox + dx, oy);
		}
		//calculating wires in bunch
		var passedwires = drawTree(tree.children[i], ox + dx, oy, tdy);
		tree.wires = tree.wires.concat(passedwires);
	}
	for(var i=0; i<tree.ends.length; i++) {
		tree.wires.push(tree.ends[i]);
	}
	return tree.wires.slice(0);
}
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
	if(end1.len != end2.len) {
		output.text(output.text() + "\nAttach " + end2.id + " to the " + (end1.marker + (end1.len - end2.len) * sign) + "' marker of " + end1.id + ".");
	} else {
		output.text(output.text() + "\nAttach the ends of " + end1.id + " and " + end2.id + " together.");
	}
	if(end1.len != 0 && end2.len != 0) {
		var sign2 = 1;
		if(!end2.asc) {
			sign2 = -1;
		}
		output.text(output.text() + "\n\tWrap tape around the " + (end1.marker + end1.len * sign) + "' marker of " + end1.id + ", and the " + (end2.marker + end2.len * sign2) + "' marker of " + end2.id + ".");
	}

	return end1;
}

function processTree(t) {
	t.processedWires = [];
	for(var d = 0; d < t.ends.length; d ++) {
		t.processedWires.push(t.ends[d]);
	}
	for(var i = 0; i < t.children.length; i++) {	
		t.processedWires.push(processTree(t.children[i]));
	}
	if(t.processedWires.length > 0) {
		var newend = t.processedWires.reduce(combine);
		newend.len += t.dist;
	}
	return newend;
}

function LoadJSON(data) {
	drawTree(data, offsetx, offsety, 0);
	var lastend = processTree(data);
	output.text(output.text() + "\n" + "Trunk is finished when the "  + (lastend.marker  + (lastend.len) * (lastend.asc ? 1 : -1)) + "' marker of " + lastend.id + " comes off the reel.");
	output.text(output.text() + "\n" +"Longest length is " + lastend.len + "'.");
}
