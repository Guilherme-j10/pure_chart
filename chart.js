var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var initialize_chart = function (options) {
    var canvas = document.getElementById(options.canvas);
    var ctx = canvas.getContext('2d');
    canvas.width = options.chart.width;
    canvas.height = options.chart.height;
    var interpolation = function (value, input, output) {
        return output[0] + (((value - input[0]) / (input[1] - input[0])) * (output[1] - output[0]));
    };
    var chart = {
        line_base_height: options.chart.height - 25,
        size_text: 11,
        size_text_tip: 13,
        current_labels: [],
        chart_column_pos: [],
        draw_element: function (load) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            ctx.fillStyle = load.color;
            ctx.shadowColor = '#1111119e';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            if (!Object.keys((load === null || load === void 0 ? void 0 : load.text) || {}).length && Object.keys((load === null || load === void 0 ? void 0 : load.coords) || {}).length)
                ctx.fillRect((_a = load.coords) === null || _a === void 0 ? void 0 : _a.x, (_b = load.coords) === null || _b === void 0 ? void 0 : _b.y, (_c = load.coords) === null || _c === void 0 ? void 0 : _c.w, (_d = load.coords) === null || _d === void 0 ? void 0 : _d.h);
            if (Object.keys((load === null || load === void 0 ? void 0 : load.text) || {}).length) {
                ctx.font = "".concat((_e = load.text) === null || _e === void 0 ? void 0 : _e.px, "px Arial");
                ctx.textAlign = ((_f = load.text) === null || _f === void 0 ? void 0 : _f.aling) || 'center';
                ctx.fillText((_g = load.text) === null || _g === void 0 ? void 0 : _g.content, (_h = load.text) === null || _h === void 0 ? void 0 : _h.coords.x, (_j = load.text) === null || _j === void 0 ? void 0 : _j.coords.y);
            }
        },
        draw_base_chart: function () {
            this.draw_element({
                color: '#ffffff2d',
                coords: { h: 1.5, w: options.chart.width, x: 0, y: this.line_base_height }
            });
        },
        draw_spikes: function () {
            var _a;
            var calculate_spikes = options.chart.width / options.series[0].data.length;
            for (var i = 0; i < options.series[0].data.length; i++) {
                var initial_point = calculate_spikes * i;
                var middle = initial_point + (calculate_spikes / 2);
                var label_content = ((_a = options === null || options === void 0 ? void 0 : options.labels) === null || _a === void 0 ? void 0 : _a.length) ? options.labels[i] : "".concat(i + 1);
                this.draw_element({
                    color: '#ffffff',
                    coords: {
                        h: 7,
                        w: 1.5,
                        x: middle,
                        y: this.line_base_height
                    }
                });
                this.draw_element({
                    color: '#ffffff',
                    text: {
                        content: label_content,
                        px: this.size_text,
                        coords: {
                            x: middle,
                            y: this.line_base_height + 25
                        }
                    }
                });
                this.current_labels.push(label_content);
            }
        },
        calculate_max_val: function () {
            var max_values = [];
            for (var _i = 0, _a = options.series; _i < _a.length; _i++) {
                var data_series = _a[_i];
                var max_value_of = data_series.data.reduce(function (acc, val) { return acc > val ? acc : val; }, 0);
                max_values.push(max_value_of);
            }
            return max_values.reduce(function (acc, val) { return acc > val ? acc : val; }, 0);
        },
        draw_columns: function () {
            var get_columns = options.series.filter(function (data) { return data.data_type === 'column'; });
            var calc_spikes_pos = options.chart.width / options.series[0].data.length;
            var diff_from_base = Math.abs(options.chart.height - this.line_base_height);
            var padding_space = interpolation(options.series.length, [0, 1000], [5, 30]);
            var complete_column_width = calc_spikes_pos - padding_space;
            var space_by_each_column = Math.abs(complete_column_width / get_columns.length);
            var get_lines = options.series.filter(function (data) { return data.data_type === 'line'; });
            var enabled_max_height = options.chart.height - diff_from_base - 10;
            var max_height = this.calculate_max_val();
            for (var x = 0; x < options.series[0].data.length; x++) {
                var initial_point = calc_spikes_pos * x;
                var initial_point_more_padding = initial_point + (padding_space / 2);
                var start_point = initial_point_more_padding;
                this.chart_column_pos.push({
                    index: x,
                    is_activate: false,
                    pos: { x: initial_point, y: 0, h: enabled_max_height, w: calc_spikes_pos }
                });
                for (var z = 0; z < get_columns.length; z++) {
                    var chart_height_column = interpolation(options.series[z].data[x], [0, max_height], [2, enabled_max_height]);
                    this.draw_element({
                        color: options.colors[z],
                        coords: {
                            h: chart_height_column,
                            w: space_by_each_column,
                            x: start_point,
                            y: Math.abs(enabled_max_height - chart_height_column)
                        }
                    });
                    start_point = start_point + space_by_each_column;
                }
            }
            for (var i = 0; i < get_lines.length; i++) {
                var coords_of_line = [];
                for (var y = 0; y < get_lines[i].data.length; y++) {
                    var chart_height_column = interpolation(get_lines[i].data[y], [0, max_height], [0, enabled_max_height]);
                    var calc_y = Math.abs(chart_height_column - enabled_max_height);
                    var pinter_x = calc_spikes_pos * y;
                    var middle_pointer_x = pinter_x + (calc_spikes_pos / 2);
                    coords_of_line.push({ x: middle_pointer_x, y: calc_y });
                }
                ctx.strokeStyle = get_lines[i].color;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(0, enabled_max_height);
                // coords_of_line.unshift({ x: 0, y: enabled_max_height });
                // coords_of_line.push({ x: options.chart.width, y: enabled_max_height });
                // const reorganize_points = (coords: Array<{ x: number, y: number }>) => {
                //   let reorganized = [];
                //   for (let x = 0; x < coords.length - 2; x += 2) {
                //     reorganized.push([
                //       coords[x],
                //       coords[x + 1],
                //       coords[x + 2]
                //     ])
                //   }
                //   return reorganized;
                // } 
                // const points = reorganize_points(coords_of_line);
                // for (let i = 0; i < points.length; i++) {
                //   const p1 = points[i][0];
                //   const pc = points[i][1];
                //   const p2 = points[i][2];
                //   const tmpx1 = p1.x - pc.x;
                //   const tmpx2 = p2.x - pc.x;
                //   const tmpy1 = p1.y - pc.y;
                //   const tmpy2 = p2.y - pc.y;
                //   const dist1 = Math.sqrt(tmpx1*tmpx1+tmpy1*tmpy1);
                //   const dist2 = Math.sqrt(tmpx2*tmpx2+tmpy2*tmpy2);
                //   const tmpx = pc.x-Math.sqrt(dist1*dist2)*(tmpx1/dist1+tmpx2/dist2)/2;
                //   const tmpy = pc.y-Math.sqrt(dist1*dist2)*(tmpy1/dist1+tmpy2/dist2)/2;
                //   ctx.quadraticCurveTo(tmpx, tmpy, p2.x, p2.y);
                //   ctx.quadraticCurveTo(pc.x, pc.y, p2.x, p2.y)
                // }
                for (var _i = 0, coords_of_line_1 = coords_of_line; _i < coords_of_line_1.length; _i++) {
                    var coord = coords_of_line_1[_i];
                    ctx.lineTo(coord.x, coord.y);
                }
                ctx.lineTo(options.chart.width, enabled_max_height);
                ctx.stroke();
                for (var _a = 0, coords_of_line_2 = coords_of_line; _a < coords_of_line_2.length; _a++) {
                    var coord = coords_of_line_2[_a];
                    ctx.fillStyle = '#fff';
                    ctx.beginPath();
                    ctx.arc(coord.x, coord.y, 3, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.closePath();
                }
            }
        },
        draw_activate_hover_columns: function () {
            for (var _i = 0, _a = this.chart_column_pos; _i < _a.length; _i++) {
                var column = _a[_i];
                if (column.is_activate) {
                    this.draw_element({
                        color: '#ffffff2d',
                        coords: { h: column.pos.h, w: column.pos.w, x: column.pos.x, y: column.pos.y }
                    });
                }
            }
        },
        draw_tooltip: function () {
            var _this = this;
            var _a;
            var max_length = (options.series.map(function (data) { return data.data_label.length * _this.size_text_tip; }))
                .reduce(function (acc, val) { return acc > val ? acc : val; }, 0);
            for (var _i = 0, _b = this.chart_column_pos; _i < _b.length; _i++) {
                var column = _b[_i];
                if (column.is_activate) {
                    var middle_space_width = options.chart.width / 2;
                    var is_left = column.pos.x < middle_space_width ? true : false; //the rendering pointer is to the left in relation to the total half of the canvas
                    var min_height_by_line = 30;
                    var padding = 10;
                    var tip_w = max_length + (padding * 2);
                    var tip_h = (min_height_by_line + (options.series.length * min_height_by_line)) + 1;
                    var pos_x_base = is_left ? (column.pos.x + column.pos.w) + 10 : (column.pos.x - tip_w) - 10;
                    var pos_y_base = (column.pos.h / 2) - (tip_h / 2);
                    this.draw_element({
                        color: 'rgb(0,0,0,.8)',
                        coords: { h: tip_h, w: tip_w, x: pos_x_base, y: pos_y_base }
                    });
                    this.draw_element({
                        color: 'rgb(255,255,255)',
                        coords: { h: 1, w: tip_w, x: pos_x_base, y: pos_y_base + 30 }
                    });
                    this.draw_element({
                        color: 'rgb(255,255,255)',
                        text: {
                            aling: 'left',
                            content: "".concat(options.label_tip).concat(this.current_labels[column.index]),
                            px: this.size_text_tip,
                            coords: { x: pos_x_base + 10, y: pos_y_base + 18 }
                        }
                    });
                    var pos_y_labels = pos_y_base + min_height_by_line;
                    for (var i = 0; i < options.series.length; i++) {
                        pos_y_labels += min_height_by_line;
                        this.draw_element({
                            color: 'rgb(255,255,255,.1)',
                            coords: { h: 1, w: tip_w, x: pos_x_base, y: pos_y_labels }
                        });
                        this.draw_element({
                            color: 'rgb(255,255,255)',
                            text: {
                                aling: 'left',
                                content: "".concat(options.series[i].data_label, ": ").concat(options.series[i].data[column.index]),
                                px: this.size_text_tip,
                                coords: { x: pos_x_base + 20, y: pos_y_labels - 10 }
                            }
                        });
                        ctx.fillStyle = ((_a = options.series[i]) === null || _a === void 0 ? void 0 : _a.color) || options.colors[i];
                        ctx.beginPath();
                        ctx.arc(pos_x_base + 10, pos_y_labels - 15, 5, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.closePath();
                    }
                }
            }
        }
    };
    var draw_everything = function () {
        ctx.clearRect(0, 0, options.chart.width, options.chart.height);
        chart.draw_activate_hover_columns();
        chart.draw_base_chart();
        chart.draw_spikes();
        chart.draw_columns();
        chart.draw_tooltip();
    };
    var disable_all_columns = function () {
        for (var _i = 0, _a = chart.chart_column_pos; _i < _a.length; _i++) {
            var column = _a[_i];
            chart.chart_column_pos[column.index] = __assign(__assign({}, chart.chart_column_pos[column.index]), { is_activate: false });
        }
        draw_everything();
    };
    var on_mouse_move = function (event) {
        var cx = event.offsetX;
        for (var _i = 0, _a = chart.chart_column_pos; _i < _a.length; _i++) {
            var column = _a[_i];
            if (cx > column.pos.x && cx < (column.pos.x + column.pos.w)) {
                chart.chart_column_pos[column.index] = __assign(__assign({}, chart.chart_column_pos[column.index]), { is_activate: true });
                continue;
            }
            chart.chart_column_pos[column.index] = __assign(__assign({}, chart.chart_column_pos[column.index]), { is_activate: false });
        }
        draw_everything();
    };
    canvas.addEventListener('mousemove', on_mouse_move);
    canvas.addEventListener('mouseout', disable_all_columns);
    var destroy_canvas_listeners = function () {
        canvas.removeEventListener('mousemove', on_mouse_move);
        canvas.removeEventListener('mouseout', disable_all_columns);
    };
    draw_everything();
    return { destroy: destroy_canvas_listeners };
};
