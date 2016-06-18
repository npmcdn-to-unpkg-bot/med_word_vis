d3.json("bundle_data3.json", function(error, data) {
		if (error) throw error;
		render_bundle(data)
	});
	function render_bundle(data){
		//1.定义数据
		var nodecolors =["#FF2D2D","#79FF79","#9393FF"];
		var linkcolors =["#FFFF6F","#80FFFF","#FF77FF"];

		var names = data.names;
		var cosmat = data.cosr;
		var tags = data.tags;

		//2.转换数据，并输出转换后的数据					
		var chord_layout = d3.layout.chord()
			                 .padding(0.03)		//节点之间的间隔
			                 .sortSubgroups(d3.descending)	//排序
			                 .matrix(cosmat);	//输入矩阵

		var groups = chord_layout.groups();
		var chords = chord_layout.chords();
		
		//3.SVG，弦图，颜色函数的定义
		var width  = 500;
		var height = 500;
		var innerRadius = width/2 * 0.7;
		var outerRadius = innerRadius * 1.1;

		var color20 = d3.scale.category20();

		var svg = d3.select("#bundle").append("svg")
			.attr("width", width)
			.attr("height", height)
		    .append("g")
			.attr("transform", "translate(" + width/2 + "," + height/2 + ")");

		//4.绘制节点（即分组，有多少个城市画多少个弧形），及绘制城市名称
		var outer_arc =  d3.svg.arc()
					 .innerRadius(innerRadius)
					 .outerRadius(outerRadius);
		
		var g_outer = svg.append("g");
		
		g_outer.selectAll("path")
				.data(groups)
				.enter()
				.append("path")
				.style("fill", function(d,i) { return nodecolors[Math.round(tags[i])-2]; })
				.style("stroke", function(d,i) { return nodecolors[Math.round(tags[i])-2]; })
				.attr("d", outer_arc );
						
		g_outer.selectAll("text")
				.data(groups)
				.enter()
				.append("text")
				.each( function(d,i) { 
					d.angle = (d.startAngle + d.endAngle) / 2; 
					d.name = names[i];
				})
				.attr("dy",".35em")
				.attr("transform", function(d){
					return "rotate(" + ( d.angle * 180 / Math.PI ) + ")" +
						   "translate(0,"+ -1.0*(outerRadius+10) +")" +
						    ( ( d.angle > Math.PI*3/4 && d.angle < Math.PI*5/4 ) ? "rotate(180)" : "");
				})
				.text(function(d){
					return d.name;
				});					

		//5.绘制内部弦（即所有城市人口的来源，即有5*5=25条弧）
		var inner_chord =  d3.svg.chord()
						.radius(innerRadius);
		
		var g_iner = svg.append("g").attr("class", "chord");

		g_iner.selectAll("path")
			.data(chords)
		    .enter()
			.append("path")
			.attr("d", inner_chord )
		    .style("fill", function(d) {
		    	 pair = [tags[d.source.index],tags[d.target.index]].toString()
		    	 if ( (pair == [2.0,3.0].toString()) || (pair == [3.0,2.0].toString()) )
		    	 	{return linkcolors[0];}
		    	 else if ( (pair == [3.0,4.0].toString()) || (pair == [4.0,3.0].toString()) )
		    	 	{return linkcolors[1];}
		    	 else {return linkcolors[2]; }
		    	})
			.style("opacity", 0.8)
			.style("stroke","#000")
			.style("stroke-width","0.5px");

		//6. 设置mouseover及mouseout事件的响应
		g_iner.selectAll("path")
			.on("mouseover",function(d,i){
				g_iner.selectAll("path")
					  .style("opacity",function(p,j){
						if(j==i)
							{ return 0.8;}
						else
							{ return 0.2;}
					});
				d3.select("#data-info")
					.selectAll("p")
					.data(d)
					.enter()
					.append("p")
					.text(names[d.source.index].toString+ "与"
						 +names[d.target.index].toString + "的相关度为"
						 +cosr[d.source.index][d.target.index].toString)

			})
			.on("mouseout",function(d,i){
				g_iner.selectAll("path")
					  .style("opacity",0.8);
			});

		g_outer.selectAll("path")
				.on("mouseover",function(d,i){
				g_iner.selectAll("path")
					  .style("opacity",function(p){
					  	if((p.source.index != i) && (p.target.index != i)) 
					  		{  return 0.2; }
					  	else
					  		{  return 0.8;} 
					  });
				
				})
				.on("mouseout",function(d,i){
				g_iner.selectAll("path")
					.style("opacity",0.8);
			});
		}