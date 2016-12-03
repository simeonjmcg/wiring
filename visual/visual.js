var canvas = document.getElementById("canvas");
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

$(canvas).click(function(e){
	var posX = e.pageX - $(this).position().left,
            posY = e.pageY - $(this).position().top;
	for(var i = 0; i < buttons.length; i++) {
		var button = buttons[i];
		if(isInside(posX, posY, button.x, button.y, button.width, button.height)) {
			console.log("is inside " + button.tree.ends[0].id);
			buttonClick(button);
		}
	}
});

function buttonClick(button) {
	var labels = "";
	var longest = 0;
	for(var i = 0; i < button.tree.ends.length; i++) {
		var w = context.measureText(button.tree.ends[i]).width;
		if(w > longest) {
			longest = w;
		}
		labels += button.tree.ends[i].id + "\n";
	}
	
	context.fillRect(button.x, button.y, longest + buttonpadding*2, textheight*button.tree.ends.length + buttonpadding*2);
	alert(labels);
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
var droplevel = 0;
function drawTree(tree, ox, oy) {
	context.fillStyle = "#000";
	var dx = tree.dist*units;
	drawLine(ox, oy, ox+dx, oy);
	drawPoint(ox, oy, 2);

	var label = "";
	if(tree.ends.length >= 1) {
		if(tree.ends.length > 1) {
			label = ", ...";
		}
		label = tree.ends[0].id + label;
		var button = {
			x: ox + dx,
			y: oy,
			width: context.measureText(label).width + buttonpadding*2,
			height: textheight + buttonpadding*2,
   			tree: tree
		};
		context.fillStyle = "#AAA";
		context.fillRect(button.x, button.y, button.width, button.height);
		buttons.push(button);
	}
	context.fillStyle = "#000";
	drawText(ox + dx + buttonpadding, oy + buttonpadding + textheight, textheight + "px Georgia", label);
	drawText(ox + dx/2 + buttonpadding, oy + buttonpadding + textheight, textheight + "px Georgia", tree.dist + "'");
	drawPoint(ox+dx, oy, 2);
	ox += dx;

	for(var i = 0; i < tree.children.length; i++) {
		context.fillstyle = "#000";
		if(i != 0) {
			var py = oy;
			droplevel++;
			oy = offsety + droplevel*drop;
			drawLine(ox, py, ox, oy);
		}
		drawTree(tree.children[i], ox, oy);
	}
}
function LoadJSON(data) {
	drawTree(data, offsetx, offsety);
}
