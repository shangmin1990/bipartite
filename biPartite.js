    /**
     * 基于二分图组件，修改为（二级分类） 条目所占比例图。
     * @Author : Benjamin, NPashaP(source)
     * @Desc:
     * 可以改进的地方(
       1.配置 2.动画效果 
       3.element的重用(现在每移动一次就要计算一次。因为数据是固定的，可以将计算完毕生成的element缓存起来，下次移动直接
     * 将缓存的ele插入到dom))
     */
    (function () {
        var bP = {};
        var mainRectWidth = 80, buffMargin = 1, minHeight = 14;

        var me = this;
        this.options = {
            colors: ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099", "#0099C6"],
            labelColumn: [-130, 40], //Column positions of labels.
            valueColumn: [-50, 100],
            barpercentColumn: [-10, 160],// x distance from left of main rect
            headerX: 108,
            headerY: -20,
            transitionWidth: 250,
            duration: 600,
            height: 300,
            sortbyKey: false
        };

        /**
         *  sets Options
         * @param {object} options an object containing options
         */
        bP.setOptions = function (options) {
            //TODO replace this property is bad , fix it
            me.options = options;
        };

        /**
       *  partData
       * @public
       * From the original data set, creates two opposing arrays containing the counts of each corresponding record on each side.
       */
        bP.partData = function (data) {
            var sData = {};

            var v1 = data.parent;

            if (me.options.sortbyKey) {
                v1 = v1.sort();
            }
            sData.parent = [v1, []];
            var children = data.child;
            for(var i = 0; i < v1.length; i++){
                sData.parent[1][i] = d3.sum(children[i].count);
            }

            return sData;
        };

        function visualize(data) {
            
            var vis = {};

            function calculatePosition(a, s, e, b, m) {
                var total = d3.sum(a);
                var sum = 0, neededHeight = 0, leftoverHeight = e - s - 2 * b * a.length;
                var ret = [];

                a.forEach(
                    function (d) {
                        var v = {};
                        v.percent = (total == 0 ? 0 : d / total);
                        v.value = d;
                        v.height = Math.max(v.percent * (e - s - 2 * b * a.length), m);
                        (v.height == m ? leftoverHeight -= m : neededHeight += v.height);
                        ret.push(v);
                    }
                );

                var scaleFact = leftoverHeight / Math.max(neededHeight, 1), sum = 0;

                ret.forEach(
                    function (d) {
                        d.percent = scaleFact * d.percent;
                        d.height = (d.height == m ? m : d.height * scaleFact);
                        d.middle = sum + b + d.height / 2;
                        d.y = s + d.middle - d.percent * (e - s - 2 * b * a.length) / 2;
                        d.h = d.percent * (e - s - 2 * b * a.length);
                        d.percent = (total == 0 ? 0 : d.value / total);
                        sum += 2 * b + d.height;
                    }
                );
                return ret;
            }

            function calculateMainPosition(a, s, e, b, m){
                var total = d3.sum(a);
                var sum = 0, neededHeight = 0, leftoverHeight = e - s - 2 * b * a.length;
                var ret = [];
                 a.forEach(
                    function (d) {
                        var v = {};
                        v.percent = (total == 0 ? 0 : d / total);
                        v.value = d;
                        v.height = Math.max(v.percent * (e - s - 2 * b * a.length), m);
                        (v.height == m ? leftoverHeight -= m : neededHeight += v.height);
                        ret.push(v);
                    }
                );

                var scaleFact = leftoverHeight / Math.max(neededHeight, 1), sum = 0;

                ret.forEach(
                    function (d) {
                        d.percent = scaleFact * d.percent;
                        d.height = (d.height == m ? m : d.height * scaleFact);
                        d.middle = sum + b + d.height / 2;
                        d.y = s + d.middle - d.percent * (e - s - 2 * b * a.length) / 2;
                        d.h = d.percent * (e - s - 2 * b * a.length);
                        d.percent = (total == 0 ? 0 : d.value / total);
                        sum += 2 * b + d.height;
                    }
                );
                return ret;
            }

            vis.mainBars = calculateMainPosition(data[1], 0, me.options.height, buffMargin, minHeight);
            vis.keys = data[0];
            return vis;
        }
        /**
         * 
         */
        function getBeginY(data, i) {
            if(i == 0){
                return 0;
            } else {
                var sum_percent = 0;
                for(var j=0; j < i; j++){
                    sum_percent += data.mainBars[j].percent;
                }
                return sum_percent;
            }

        }
        function visualizeEdges(srcElement, visData) {
            // 边数
            var color = srcElement.style.fill;
            var height = srcElement.height.baseVal.value;
            var width = srcElement.width.baseVal.value;
            var y = srcElement.y.baseVal.value;
            var edges = [];
            visData.mainBars.forEach(function(value, i){
                var edge = {};
                edge.color = color;
                var begin_y_parent = getBeginY(visData, i) * height ;
                var begin_y_child = value.middle - value.height / 2;
                // var begin_y = height * begin_y_percent;
                var point1 = '0,' + (y + begin_y_parent);
                var point2 = me.options.transitionWidth + ', '+ begin_y_child;
                var point3 = me.options.transitionWidth + ', '+ (value.height + begin_y_child);
                var point4 =  '0, ' + (begin_y_parent + y + height * value.percent);
                edge.points = [point1, point2, point3, point4];
                edges.push(edge);
            });
            // edges.splice(1);
            return edges;
        }

        function arcTween(a) {
            //差值器。。。
            var i = d3.interpolate([a.points[0], a.points[1], a.points[1], a.points[3]], a.points);
            this._current = i(0);//https://github.com/damiangreen/EnvoyCustomerRegistration
            return function (t) {
                return i(t).join(' ');
            };
        }
        /**
         * data : visualData处理之后的data
         * id 父容器的id
         * p 0, 左侧父类的排版 1 右侧子类的排列
         */
        function drawPart(data, id, p, s) {
            d3.select("#" + id).append("g").attr("class", "part" + p).attr("transform", "translate(" + (p * (me.options.transitionWidth + mainRectWidth)) + ",0)");
            var el = d3.select("#" + id).select(".part" + p);
            // el.append("g").attr("class", "subbars");
            el.append("g").attr("class", "mainbars");

            var mainbar = d3.select("#" + id).select(".part" + p).select(".mainbars").selectAll(".mainbar").data(data.mainBars)
                .enter().append("g").attr("class", "mainbar");

            // data.mainBars.forEach(function(value){
                
            // });
        if(p === 0){
            mainbar.append("rect").attr("class", "mainrect")
                .attr("x", 0).attr("y", function (d) { return d.middle - d.height / 2; })
                .style('fill', function(d, i){
                    return me.options.colors[i];
                })
                .attr("width", mainRectWidth).attr("height", function (d) { return d.height; })

        }else{
            mainbar.append("rect").attr("class", "mainrect")
                .attr("x", 0).attr("y", function (d) { return d.middle - d.height / 2; })
                .style('fill', me.options.colors[s])
                .attr("width", mainRectWidth)
                .attr("height", function (d) { return 0; })
        }
            
            //draw bar label
            mainbar.append("text").attr("class", "barlabel")
                .attr("x", me.options.labelColumn[p]).attr("y", function (d) { return d.middle + 5; })
                .text(function (d, i) { return data.keys[i]; })
                .attr("text-anchor", "start");

            //draw count label
            mainbar.append("text").attr("class", "barvalue")
                .attr("x", me.options.valueColumn[p]).attr("y", function (d) { return d.middle + 5; })
                .text(function (d, i) { return d.value; })
                .attr("text-anchor", "end");

            //draw percentage label
            mainbar.append("text").attr("class", "barpercent")
                .attr("x", me.options.barpercentColumn[p]).attr("y", function (d) { return d.middle + 5; })
                .text(function (d, i) { return "( " + Math.round(100 * d.percent) + "%)"; })
                .attr("text-anchor", "end");
        }

        function drawEdges(data, id) {
            d3.select("#" + id).append("g").attr("class", "edges").attr("transform", "translate(" + mainRectWidth + ",0)");

            d3.select("#" + id).select(".edges").selectAll(".edge").data(data).enter().append("polygon").attr("class", "edge")
                .attr("points", function (d) {return "0 0 1 1 2 2";}).style("fill", function (d) { return d.color; }).style("opacity", 0.5)
                // .attr("points", function (d) {return d.points.join(' ');}).style("fill", function (d) { return d.color; }).style("opacity", 0.5)
                .each(function (d) { this._current = d; });
        }

         function drawHeader(header, id) {
        d3.select("#" + id).append("g").attr("class", "header").append("text").text(header[2])
            .attr("x", me.options.headerX).attr("y", me.options.headerY);

        [0, 1].forEach(function (d) {
            var width = 0;
            if(d === 1){
                width = d * me.options.transitionWidth + mainRectWidth;
            }
            var h = d3.select("#" + id).select(".header").append("g").attr("class", "header").attr('transform', 'translate('+ width +', 0)');

            h.append("text").text(header[d]).attr("x", (me.options.labelColumn[d] - 5)).attr("y", -5);
            h.append("text").text("Count").attr("x", (me.options.valueColumn[d] - 10)).attr("y", -5);

            h.append("line").attr("x1", me.options.labelColumn[d] - 10).attr("y1", -2).attr("x2", me.options.barpercentColumn[d] + 10).attr("y2", -2)
                .style("stroke", "black").style("stroke-width", "1").style("shape-rendering", "crispEdges");
        });
    }

        function transitionPart(data, id, p) {
            var duration = me.options.duration;
            var mainbar = d3.select("#" + id).select(".part" + p).select(".mainbars").selectAll(".mainbar").data(data.mainBars);

            mainbar.select(".mainrect").transition().duration(duration)
                .attr("y", function (d) { return d.middle - d.height / 2; }).attr("height", function (d) { return d.height; });

            mainbar.select(".barlabel").transition().duration(duration).attr("y", function (d) { return d.middle + 5; });
            mainbar.select(".barvalue").transition().duration(duration).attr("y", function (d) { return d.middle + 5; }).text(function (d, i) { return d.value; });
            mainbar.select(".barpercent").transition().duration(duration)
                .attr("y", function (d) { return d.middle + 5; })
                .text(function (d, i) { return "( " + Math.round(100 * d.percent) + "%)"; });

        }

        function transitionEdges(data, id) {
            d3.select("#" + id).select(".edges").selectAll(".edge").data(data)
                .transition().duration(me.options.duration)
                .attrTween("points", arcTween)
                .style("opacity", function (d) { return 0.5 });
        }

        // function transition(data, id) {
        //     transitionPart(data, id, 0);
        //     transitionEdges(data, id);
        // }

        bP.draw = function (data, containerEl) {

            var svg = d3.select('#'+containerEl)
               .append("svg")
               .attr('width', me.options.width)
               .attr('height', (me.options.height + me.options.margin.b + me.options.margin.t))
               .append("g")
               .attr("transform", "translate(" + me.options.margin.l + "," + me.options.margin.t + ")");

            data.forEach(function (biP, s) {
                svg.append("g")
                    .attr("id", biP.id)
                    .attr("transform", "translate(" + (550 * s) + ",0)");
                    // 左侧一级的布局
                var data_ = bP.partData(biP.data).parent;
                var visData = visualize(data_);
                drawPart(visData, biP.id, 0);
                drawHeader(biP.header, biP.id);
               
                [0].forEach(function (p) {
                    d3.select("#" + biP.id)
                        .select(".part" + p)
                        .select(".mainbars")
                        .selectAll(".mainbar")
                        // .selectAll('rect')
                        .on("mouseover", function (d, i) { return bP.selectSegment(data, p, i); })
                        .on("mouseout", function (d, i) { return bP.deSelectSegment(data, p, i); });
                });
            });
        };

        bP.selectSegment = function (data, m, s) {
            var evt = d3.event;
            var target = evt.target;
            if(target.tagName.toLowerCase() !== 'rect'){
                return;
            }
            data.forEach(function (k) {
                var selectedBar = d3.select("#" + k.id).select(".part" + m).select(".mainbars").selectAll(".mainbar").filter(function (d, i) { return (i == s); });
                selectedBar.selectAll('.mainrect, .barlabel, .barvalue, .barpercent').classed("selected", true);

                if(bP.currentSelected != s){
                    bP.currentSelected = s;
                }else{
                    return;
                }
                //remove之前可以使用transition,再延时执行remove等动作
                d3.select("#" + k.id).select(".part1").remove();
                d3.select("#" + k.id).select(".edges").remove();
                var originalData = k.data.child[s];
                var convertData = [];
                convertData.push(originalData.key);
                convertData.push(originalData.count);
                // console.log(convertData);
                var visData = visualize(convertData);
                // 画边
                var edges_ = visualizeEdges(target, visData);
                drawPart(visData, k.id, 1, s);
                drawEdges(edges_, k.id);
                transitionPart(visData, k.id, 1, s);
                transitionEdges(edges_, k.id);
            });
        };

        bP.deSelectSegment = function (data, m, s) {
            data.forEach(function (k) {
                var selectedBar = d3.select("#" + k.id).select(".part" + m).select(".mainbars").selectAll(".mainbar").filter(function (d, i) { return (i == s); });
                selectedBar.selectAll(".mainrect, .barlabel, .barvalue, .barpercent").classed("selected", false);
            });
        };
        window.bP = bP;
        // return bP;
    })();
