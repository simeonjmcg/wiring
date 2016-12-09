var canvas = $("#canvas")[0];
var wrapper = $("#wrapper");
var sidebar = $("#sidebar");
var output = $("#output");
var context = canvas.getContext("2d");

var units = 8; // 1 foot is 4 px
var drop = 35; 
var buttonpadding = 5;
var textheight = 12;

var buttons = [];

var offsetx = 30;
var offsety = 30;

function drawLine(x1, y1, x2, y2) {
	context.moveTo(x1, y1);
	context.lineTo(x2, y2);
	context.stroke();
}

function isInside(x, y, x1, y1, w, h) {
	return x > x1 && x < x1 + w && y > y1 && y < y1+h;
}


function drawText(x, y, font, text) {
	context.font = font;
	context.fillText(text, x, y, 500,15);
}
function drawPoint(x, y, rad) {
	context.arc(x, y, rad, 0, 2 * Math.PI);
	context.fill();
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
		output.text(output.text() + "\n" +"Attach " + end2.id + " to the " + (end1.marker + (end1.len - end2.len) * sign) + "' marker of " + end1.id + ".");
	} else {
		output.text(output.text() + "\n" +"Attach the ends of " + end1.id + " and " + end2.id + " together.");
	}
	if(end1.len != 0 && end2.len != 0) {
		var sign2 = 1;
		if(!end2.asc) {
			sign2 = -1;
		}
		output.text(output.text() + "\n" +"\t\tWrap tape around the " + (end1.marker + end1.len * sign) + "' marker of " + end1.id + ", and the " + (end2.marker + end2.len * sign2) + "' marker of " + end2.id + ".");
	}

	return end1;
}

var selectedTree = null;

var droplevel = 0;
function drawTree(tree, ox, oy) {
	context.fillStyle = "#000";
	var dx = tree.dist*units;
	drawLine(ox, oy, ox+dx, oy);
	drawPoint(ox, oy, 2);
	
	var button = $("<input></input>");
	button.attr({
		"type": "radio",
		"name": "node"
	});
	wrapper.append(button);
	button.css({
		"position": "absolute",
		"left": ox + dx - button.width()/2,
		"top": oy - button.height()/2
	});
	button[0].tree = tree;
	button.click(function(e) {
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
			sidebar.append(tree.wires[i].id + "\n");
		}
	});
	context.fillStyle = "#000";
	if(tree.dist > 0) {
		drawText(ox + dx/2 + buttonpadding, oy + buttonpadding + textheight, textheight + "px Georgia", tree.dist + "'");
	}
	for(var i = 0; i < tree.ends.length; i++) {
		drawText(ox + dx + buttonpadding, oy + buttonpadding + i * textheight, textheight + "px Georgia", tree.ends[i].id);
	}
	
	drawPoint(ox+dx, oy, 2);
	
	if(tree.wires == null) {
		tree.wires = [];
	}

	for(var i = 0; i < tree.children.length; i++) {
		context.fillstyle = "#000";
		if(i != 0) {
			var py = oy;
			droplevel++;
			oy = offsety + droplevel*drop;
			drawLine(ox + dx, py, ox + dx, oy);
		}
		//calculating wires in bunch
		var passedwires = drawTree(tree.children[i], ox + dx, oy);
		tree.wires = tree.wires.concat(passedwires);
	}
	for(var i=0; i<tree.ends.length; i++) {
		tree.wires.push(tree.ends[i]);
	}
	return tree.wires.slice(0);
}
function traverse(t) {
	for(var i = 0; i < t.children.length; i++) {
		
		t.ends.push(traverse(t.children[i]));
	}
	var newend = t.ends.reduce(combine);
	newend.len += t.dist;
	return newend;
}

function copyTree(tree) {
	var t = {};
	t.ends = [];
	for(var i = 0; i < tree.ends.length; i++) {
		t.ends[i] = {};
		for(var d in tree.ends[i]) {
			t.ends[i][d] = tree.ends[i][d];
		}
	}
	for(var i in tree) {
		t[i] = tree[i];
	}
	for(var i = 0; i < tree.children.length; i++) {
		t.children[i] = copyTree(tree.children[i]);
	}
	return t;
}

function LoadJSON(data) {
	drawTree(data, offsetx, offsety);
	var lastend = traverse(data);
	output.text(output.text() + "\n" + "Trunk is finished when the "  + (lastend.marker  + (lastend.len) * (lastend.asc ? 1 : -1)) + "' marker of " + lastend.id + " comes off the reel.");
	output.text(output.text() + "\n" +"Longest length is " + lastend.len + "'.");
}
