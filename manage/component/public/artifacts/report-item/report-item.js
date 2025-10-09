Vue.view("report-item", {
	template: "#report-item",
	props: {
		item: {
			type: Object,
			required: true
		},
		title: {
			type: String,
			required: false
		}
	},
	data: function() {
		return {
			raw: null
		}
	},
	computed: {
		resultType: function() {
			// TODO: might want to dynamically check if it is correct?
			return this.item.resultType;
		},
		visualisationType: function() {
			var resultType = this.resultType;
			if (resultType == "list") {
				return "table";
			}
			else if (resultType == "fact") {
				return "text";
			}
			else if (resultType == "normalized") {
				return "line";
			}
		},
		columns: function() {
			var row = this.raw;
			// should be an array!
			if (row instanceof Array) {
				row = row[0];
			}
			return Object.keys(row);
		}
	},
	created: function() {
		if (this.item && this.item.data) {
			this.raw = JSON.parse(this.item.data);
		}
	},
	// if mounted and we have a normalized, draw it
	mounted: function() {
		if (this.resultType == "normalized") {
			// need to be fully rendered to be able to get a correct bounding box for $el
			Vue.nextTick(this.draw);
		}
	},
	methods: {
		draw: function() {
			var options = {
				visualisation: "bar",
				data: {
					defaultValue: 0
				},
				x: {
					tickSize: 5,
					rotateLabel: 30
				},
				y: {
					tickSize: 5,
					include0: false,
					amountOfTicks: 10,
					rotateLabel: 0  //-30
				},
				margin: {
					top: 10,
					bottom: 100,
					left: 100,
					right: 50
				}
			}
			
			var svg = this.$refs.svg;
			var box = this.$el.getBoundingClientRect();
			
			var availableWidth = box.width;
			var availableHeight = box.height;
			
			// margin is always on both sides
			availableHeight -= options.margin.top + options.margin.bottom;
			availableWidth -= options.margin.left + options.margin.right;
			
			var data = this.raw;
			
			// calculate min/max for scaling purposes
			var min = null;
			var max = null;
			
			// if we have no default value, we strip out the items without a value
			if (options.data.defaultValue == null) {
				data = data.filter(function(record) {
					return record.value != null;
				});
			}
			
			data.forEach(function(record) {
				// set default value
				if (record.value == null) {
					record.value = options.data.defaultValue;
				}
				
				if (min == null || (record.value != null && record.value < min)) {
					min = record.value;
				}
				if (max == null || (record.value != null && record.value > max)) {
					max = record.value;
				}
			});
			
			var round = function(number, amountOfDecimals) {
				var multiplier = Math.pow(10, amountOfDecimals);
				return Math.round(number * multiplier) / multiplier;
			};
			
			// can only draw something sensible if there is _some_ valid data
			if (min != null && max != null) {
				// can optionally make sure we start from 0
				if (options.y.include0) {
					min = Math.min(min, 0);
				}

				// pixels per record
				// note that the first point is drawn ON the y-axis and the last is drawn at the very end of the image, so we count 1 less
				var ppr = availableWidth / (data.length - 1);
				
				var range = max - min;
				
				// pixels per value
				var ppv = availableHeight / range;
				
				var y = function(value) {
					// we are counting from the "top" which is considered the max value!
					return options.margin.top + ((max - value) * ppv);
				}
				var x = function(index) {
					return options.margin.left + (index * ppr);
				}
				
				// draw x-axis
				var xAxis = document.createElementNS("http://www.w3.org/2000/svg", "path");
				xAxis.setAttribute("d", "M" + options.margin.left + " " + (options.margin.top + availableHeight) + " l" + availableWidth + " 0");
				xAxis.setAttribute("class", "axis axis-x");
				svg.appendChild(xAxis);
				
				var xTicks = document.createElementNS("http://www.w3.org/2000/svg", "g");
				xTicks.setAttribute("class", "x-ticks");
				// we add text elements for all records, then hide the ones that are overlapping
				data.forEach(function(record, index) {
					// not for 0
					var tick = document.createElementNS("http://www.w3.org/2000/svg", "path");
					tick.setAttribute("d", "M" + x(index) + " " + (y(min) - (options.x.tickSize / 2)) + " l0 " + options.x.tickSize);
					tick.setAttribute("class", "tick");
					xTicks.appendChild(tick);
					
					var label = document.createElementNS("http://www.w3.org/2000/svg", "text");
					label.textContent = record.label ? record.label : index;
					label.setAttribute("x", x(index));
					label.setAttribute("y", y(min) + options.x.tickSize);
					// top left instead bottom left
					label.setAttribute("dominant-baseline", "hanging");
					label.setAttribute("class", "tick-label");
					if (options.x.rotateLabel) {
						// need to rotate around the position its at
						label.setAttribute("transform", "rotate(" + options.x.rotateLabel + " " + label.getAttribute("x") + " " + label.getAttribute("y") + ")");
					}
					xTicks.appendChild(label);
				});
				svg.appendChild(xTicks);
				
				// draw y-axis
				var yAxis = document.createElementNS("http://www.w3.org/2000/svg", "path");
				yAxis.setAttribute("d", "M" + options.margin.left + " " + options.margin.top + " l0 " + availableHeight);
				yAxis.setAttribute("class", "axis axis-y");
				svg.appendChild(yAxis);
				
				var yTicks = document.createElementNS("http://www.w3.org/2000/svg", "g");
				yTicks.setAttribute("class", "y-ticks");
				for (var i = 0; i <= options.y.amountOfTicks; i++) {
					var value = min + ((range / options.y.amountOfTicks) * i);
					// not for 0
					var tick = document.createElementNS("http://www.w3.org/2000/svg", "path");
					tick.setAttribute("d", "M" + (options.margin.left - (options.y.tickSize / 2)) + " " + y(value) + " l" + options.y.tickSize + " 0");
					tick.setAttribute("class", "tick");
					yTicks.appendChild(tick);
					
					var label = document.createElementNS("http://www.w3.org/2000/svg", "text");
					label.textContent = round(value, 2);
					label.setAttribute("x", options.margin.left - options.y.tickSize);
					label.setAttribute("y", y(value));
					label.setAttribute("class", "tick-label");
					// want it to be right-aligned
					label.setAttribute("text-anchor", "end")
        			//dominant-baseline="hanging"
					if (options.y.rotateLabel) {
						// need to rotate around the position its at
						label.setAttribute("transform", "rotate(" + options.y.rotateLabel + " " + label.getAttribute("x") + " " + label.getAttribute("y") + ")");
					}
					yTicks.appendChild(label);
				};
				svg.appendChild(yTicks);
				
				if (options.visualisation == "line") {
					// append as last to layer over rest
					var parts = data.map(function(record, index) {
						return (index == 0 ? "M" : "L")
							+ x(index)
							+ " "
							+ y(record.value);
					});
					var line = document.createElementNS("http://www.w3.org/2000/svg", "path");
					line.setAttribute("d", parts.join(" "));
					line.setAttribute("class", "line");
					svg.appendChild(line);
				}
				else if (options.visualisation == "bar") {
					var bars = document.createElementNS("http://www.w3.org/2000/svg", "g");
					
					svg.appendChild(bars);
				}
				
				// TODO: add resize handler with debounce
			}
		}
	}
});