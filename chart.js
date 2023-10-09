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
    var _a;
    var canvas = document.getElementById(options.canvas);
    var ctx = canvas.getContext('2d');
    canvas.width = options.chart.width;
    canvas.height = options.chart.height;
    var interpolation = function (value, input, output) {
        return output[0] + (((value - input[0]) / (input[1] - input[0])) * (output[1] - output[0]));
    };
    var check_data_integrity = function () {
        var validation = {
            _success: true,
            message: ''
        };
        if (["pie", "pie_interpolated", "pie_lines"].includes(options.chart.type)) {
            for (var _i = 0, _a = options.series; _i < _a.length; _i++) {
                var data = _a[_i];
                if (data.data.length > 1) {
                    validation._success = false;
                    validation.message = 'Pie type dont need more than one element on array.';
                    break;
                }
            }
            if (options.chart.type === "pie_lines") {
                for (var _b = 0, _c = options.series; _b < _c.length; _b++) {
                    var data = _c[_b];
                    if (data.data[0] > 100) {
                        validation._success = false;
                        validation.message = 'Pie_line accepts values up to 100.';
                        break;
                    }
                }
            }
        }
        if (options.chart.type === 'normal') {
            for (var _d = 0, _e = options.series; _d < _e.length; _d++) {
                var data = _e[_d];
                if (typeof (data === null || data === void 0 ? void 0 : data.data_type) === 'undefined') {
                    validation._success = false;
                    validation.message = 'Invalid data_type.';
                    break;
                }
            }
        }
        if (!validation._success)
            return validation;
        var amount_data = options.series[0].data.length;
        for (var _f = 0, _g = options.series; _f < _g.length; _f++) {
            var data = _g[_f];
            if (data.data.length === amount_data)
                continue;
            validation._success = false;
            validation.message = 'Your data length not is the same.';
            break;
        }
        if (validation._success) {
            if (!amount_data) {
                for (var i = 0; i < options.series.length; i++) {
                    options.series[i].data = Array.from({ length: 12 }).map(function () { return 0; });
                }
            }
            var get_all_colors = options.series.map(function (data) { return data.color; });
            for (var _h = 0, get_all_colors_1 = get_all_colors; _h < get_all_colors_1.length; _h++) {
                var color = get_all_colors_1[_h];
                var removed_prefix = color.split('#')[1];
                if (removed_prefix.length === 6)
                    continue;
                validation._success = false;
                validation.message = 'The colors provided need be a hex code of 6 char.';
                break;
            }
        }
        return validation;
    };
    var default_stroke_width = (((_a = options === null || options === void 0 ? void 0 : options.stroke_line_settings) === null || _a === void 0 ? void 0 : _a.width) || 3);
    var chart = {
        line_base_height: options.chart.height - 25,
        size_text: 11,
        size_text_tip: 13,
        padding_top: 22,
        margin_borders: 10,
        min_side_by_side: 0,
        default_stroke_style: {
            width: default_stroke_width,
        },
        enable_height: ((options === null || options === void 0 ? void 0 : options.disable_sparklines) || false) ?
            options.chart.height - default_stroke_width : 0,
        min_width: (options === null || options === void 0 ? void 0 : options.disable_sparklines) ? 0 : 30,
        current_labels: [],
        chart_column_pos: [],
        draw_element: function (load) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            ctx.beginPath();
            ctx.fillStyle = load.color;
            ctx.shadowColor = '#1111119e';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            if (!Object.keys((load === null || load === void 0 ? void 0 : load.text) || {}).length && Object.keys((load === null || load === void 0 ? void 0 : load.coords) || {}).length) {
                ctx.fillRect((_a = load.coords) === null || _a === void 0 ? void 0 : _a.x, (_b = load.coords) === null || _b === void 0 ? void 0 : _b.y, (_c = load.coords) === null || _c === void 0 ? void 0 : _c.w, (_d = load.coords) === null || _d === void 0 ? void 0 : _d.h);
            }
            if (Object.keys((load === null || load === void 0 ? void 0 : load.text) || {}).length) {
                ctx.font = "".concat((_e = load.text) === null || _e === void 0 ? void 0 : _e.px, "px Arial");
                ctx.textAlign = ((_f = load.text) === null || _f === void 0 ? void 0 : _f.aling) || 'center';
                ctx.fillText((_g = load.text) === null || _g === void 0 ? void 0 : _g.content, (_h = load.text) === null || _h === void 0 ? void 0 : _h.coords.x, (_j = load.text) === null || _j === void 0 ? void 0 : _j.coords.y);
            }
            ctx.closePath();
        },
        draw_base_chart: function () {
            this.draw_element({
                color: '#ffffff2d',
                coords: { h: 1.5, w: options.chart.width - this.min_width, x: this.min_width, y: this.line_base_height }
            });
        },
        draw_spikes: function () {
            var _a;
            var calculate_spikes = (options.chart.width - (this.min_width + this.margin_borders)) / options.series[0].data.length;
            for (var i = 0; i < options.series[0].data.length; i++) {
                var initial_point = calculate_spikes * i;
                var middle = initial_point + (calculate_spikes / 2) + (this.min_width + this.margin_borders);
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
        get_rgb_color: function (hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },
        draw_columns: function () {
            var _this = this;
            var _a, _b, _c, _d;
            var vertical_boarder = (options === null || options === void 0 ? void 0 : options.hide_vertical_data_set) ? 0 : this.margin_borders;
            var enable_stroke_bars = (_a = options === null || options === void 0 ? void 0 : options.stroke_line_settings) === null || _a === void 0 ? void 0 : _a.opacity_bar_enabled;
            var get_columns = options.series.filter(function (data) { return data.data_type === 'column'; });
            var calc_spikes_pos = (options.chart.width - (this.min_width + vertical_boarder)) / options.series[0].data.length;
            var padding_space = interpolation(options.series.length, [0, 50], [5, 30]);
            var complete_column_width = calc_spikes_pos - padding_space;
            var space_by_each_column = Math.abs((complete_column_width + (enable_stroke_bars ? this.default_stroke_style.width : 0)) / get_columns.length);
            var get_lines = options.series.filter(function (data) { return data.data_type === 'line'; });
            var max_height = this.calculate_max_val();
            for (var x = 0; x < options.series[0].data.length; x++) {
                var initial_point = (calc_spikes_pos * x) + this.min_width + vertical_boarder;
                var initial_point_more_padding = initial_point + (padding_space / 2);
                var start_point = initial_point_more_padding;
                this.chart_column_pos.push({
                    index: x,
                    is_activate: false,
                    pos: { x: initial_point, y: 0, h: this.enable_height, w: calc_spikes_pos }
                });
                for (var z = 0; z < get_columns.length; z++) {
                    var chart_height_column = interpolation(options.series[z].data[x], [0, max_height], [2, this.enable_height - (padding_space / 2)]);
                    if (enable_stroke_bars) {
                        var h = chart_height_column;
                        var w = space_by_each_column - this.default_stroke_style.width;
                        var x_1 = start_point;
                        var y = Math.abs(this.enable_height - chart_height_column);
                        ctx.beginPath();
                        var rgb = this.get_rgb_color(options.series[z].color);
                        ctx.fillStyle = "rgb(".concat(rgb === null || rgb === void 0 ? void 0 : rgb.r, ", ").concat(rgb === null || rgb === void 0 ? void 0 : rgb.g, ", ").concat(rgb === null || rgb === void 0 ? void 0 : rgb.b, ", .2)");
                        ctx.strokeStyle = options.series[z].color;
                        ctx.lineWidth = this.default_stroke_style.width;
                        ctx.moveTo(x_1, y);
                        ctx.lineTo((x_1 + w), y);
                        ctx.lineTo((x_1 + w), (y + h));
                        ctx.lineTo(x_1, (y + h));
                        ctx.lineTo(x_1, y - 1);
                        ctx.stroke();
                        ctx.fill();
                        ctx.closePath();
                    }
                    if (!enable_stroke_bars) {
                        this.draw_element({
                            color: options.series[z].color,
                            coords: {
                                h: chart_height_column,
                                w: space_by_each_column,
                                x: start_point,
                                y: Math.abs(this.enable_height - chart_height_column)
                            }
                        });
                    }
                    start_point = start_point + space_by_each_column;
                }
            }
            for (var i = 0; i < get_lines.length; i++) {
                var coords_of_line = [];
                for (var y = 0; y < get_lines[i].data.length; y++) {
                    var chart_height_column = interpolation(get_lines[i].data[y], [0, max_height], [0, this.enable_height - 5]);
                    var calc_y = Math.abs(chart_height_column - this.enable_height);
                    var pinter_x = calc_spikes_pos * y;
                    var middle_pointer_x = pinter_x + (calc_spikes_pos / 2);
                    coords_of_line.push({ x: middle_pointer_x + (this.min_width + vertical_boarder), y: calc_y });
                }
                ctx.strokeStyle = get_lines[i].color;
                ctx.lineWidth = this.default_stroke_style.width;
                var is_spline_cubic = !(options === null || options === void 0 ? void 0 : options.hermit_enable) ? true : false;
                ctx.beginPath();
                ctx.moveTo((this.min_width + vertical_boarder), this.enable_height);
                if (options === null || options === void 0 ? void 0 : options.smooth) {
                    coords_of_line.unshift({ x: (this.min_width + vertical_boarder), y: this.enable_height });
                    coords_of_line.unshift({ x: (this.min_width + vertical_boarder), y: this.enable_height });
                    coords_of_line.push({ x: options.chart.width, y: this.enable_height });
                    var hermit_interpolation = function (x, x1, y1, x2, y2) {
                        var t = (x - x1) / (x2 - x1);
                        var h00 = 1 - 3 * Math.pow(t, 2) + 2 * Math.pow(t, 3);
                        var h01 = 3 * Math.pow(t, 2) - 2 * Math.pow(t, 3);
                        return h00 * y1 + h01 * y2;
                    };
                    if (!is_spline_cubic) {
                        for (var x = 0; x < coords_of_line.length - 1; x += 1) {
                            var p1 = coords_of_line[x];
                            var p2 = coords_of_line[x + 1];
                            var current_x = p1.x;
                            var steps = 0.1;
                            while (current_x <= p2.x) {
                                current_x += steps;
                                var current_y = hermit_interpolation(current_x, p1.x, p1.y, p2.x, p2.y);
                                ctx.lineTo(current_x, current_y);
                            }
                        }
                    }
                    if (is_spline_cubic) {
                        var reorganize_points = function (coords) {
                            var reorganized = [];
                            for (var x = 0; x < coords.length - 1; x += 1) {
                                reorganized.push([
                                    coords[x],
                                    coords[x + 1],
                                    coords[x + 2]
                                ]);
                            }
                            return reorganized;
                        };
                        var points = reorganize_points(coords_of_line);
                        var get_control_points = function (x0, y0, x1, y1, x2, y2, t) {
                            var d1 = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
                            var d2 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                            var fa = t * d1 / (d1 + d2);
                            var fb = t * d2 / (d1 + d2);
                            var p1x = x1 - fa * (x2 - x0);
                            var p1y = y1 - fa * (y2 - y0);
                            var p2x = x1 + fb * (x2 - x0);
                            var p2y = y1 + fb * (y2 - y0);
                            return [p1x, p1y, p2x, p2y];
                        };
                        var tension = 0.35;
                        for (var i_1 = 0; i_1 < points.length - 1; i_1++) {
                            var p1_1 = points[i_1][0];
                            var p1_c = points[i_1][1];
                            var p1_2 = points[i_1][2] || { x: options.chart.width, y: this.enable_height };
                            var p2_1 = points[i_1 + 1][0];
                            var p2_c = points[i_1 + 1][1];
                            var p2_2 = points[i_1 + 1][2] || { x: options.chart.width, y: this.enable_height };
                            var _e = get_control_points(p1_1.x, p1_1.y, p1_c.x, p1_c.y, p1_2.x, p1_2.y, tension), cp1_1x = _e[0], cp1_1y = _e[1], cp1_2x = _e[2], cp1_2y = _e[3];
                            var _f = get_control_points(p2_1.x, p2_1.y, p2_c.x, p2_c.y, p2_2.x, p2_2.y, tension), cp2_1x = _f[0], cp2_1y = _f[1], cp2_2x = _f[2], cp2_2y = _f[3];
                            if (p1_c.y === p1_2.y && p1_c.y === this.enable_height) {
                                cp2_1y = p1_c.y;
                                cp1_2y = p1_c.y;
                            }
                            else {
                                var limit_curve_on_base = function (y) {
                                    var limit = 20;
                                    if (y > (_this.enable_height - limit) && y < _this.enable_height)
                                        return true;
                                    return false;
                                };
                                if (p1_2.y === this.enable_height && limit_curve_on_base(p1_c.y)) {
                                    cp1_2y = p1_2.y;
                                    cp2_1y = p1_2.y;
                                    cp2_1x = p1_2.x - ((70 / 100) * Math.abs(p1_c.x - p1_2.x));
                                }
                                if (p1_c.y === this.enable_height && limit_curve_on_base(p1_2.y)) {
                                    cp1_2y = p1_c.y;
                                    cp2_1y = p1_c.y + 5;
                                }
                                else {
                                    if (p1_2.y === this.enable_height)
                                        cp2_1y = p1_2.y + 3;
                                    if (p1_c.y === this.enable_height)
                                        cp1_2y = p1_c.y + 3;
                                }
                            }
                            ctx.bezierCurveTo(cp1_2x, cp1_2y, cp2_1x, cp2_1y, p1_2.x, p1_2.y);
                        }
                    }
                }
                if (!(options === null || options === void 0 ? void 0 : options.smooth)) {
                    for (var _i = 0, coords_of_line_1 = coords_of_line; _i < coords_of_line_1.length; _i++) {
                        var coord = coords_of_line_1[_i];
                        ctx.lineTo(coord.x, coord.y);
                    }
                    ctx.lineTo(options.chart.width, this.enable_height);
                }
                ctx.stroke();
                if ((_b = options === null || options === void 0 ? void 0 : options.stroke_line_settings) === null || _b === void 0 ? void 0 : _b.fill) {
                    if ((_c = options === null || options === void 0 ? void 0 : options.stroke_line_settings) === null || _c === void 0 ? void 0 : _c.fill_color)
                        ctx.fillStyle = (_d = options === null || options === void 0 ? void 0 : options.stroke_line_settings) === null || _d === void 0 ? void 0 : _d.fill_color;
                    ctx.fill();
                }
                ctx.closePath();
                var dots_enable = typeof options.enable_data_dots === 'undefined' ? true : options.enable_data_dots;
                if (dots_enable) {
                    for (var _g = 0, coords_of_line_2 = coords_of_line; _g < coords_of_line_2.length; _g++) {
                        var coord = coords_of_line_2[_g];
                        if (coord.x <= 0 ||
                            coord.x >= options.chart.width ||
                            coord.x === vertical_boarder ||
                            coord.x === (this.min_width + vertical_boarder))
                            continue;
                        ctx.fillStyle = '#fff';
                        ctx.beginPath();
                        ctx.arc(coord.x, coord.y, 3, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.closePath();
                    }
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
        calculate_max_value_enabled: function () {
            var min_space = 25;
            var get_max_value = (this.calculate_max_val()) || 10;
            var loops = (this.enable_height) / min_space;
            var increaser = get_max_value / loops;
            var vertical_data = [0];
            for (var x = 0; x < loops; x++)
                vertical_data.push(vertical_data[vertical_data.length - 1] + increaser);
            get_max_value = vertical_data.reduce(function (acc, val) { return acc > val ? acc : val; }, 0);
            return { get_max_value: get_max_value, vertical_data: vertical_data };
        },
        draw_side_left_height_data: function () {
            var draw_xaxis = true;
            var dashed_enabled = true;
            var diff_from_base = Math.abs(options.chart.height - this.line_base_height);
            this.enable_height = options.chart.height - diff_from_base - this.margin_borders;
            if ((options === null || options === void 0 ? void 0 : options.hide_vertical_data_set) === true)
                return;
            var _a = this.calculate_max_value_enabled(), get_max_value = _a.get_max_value, vertical_data = _a.vertical_data;
            this.min_width = ("".concat(parseInt(get_max_value)).length * this.size_text) + (this.size_text / 2);
            this.draw_element({
                color: '#ffffff2d',
                coords: { w: 1.5, h: this.enable_height + this.margin_borders, x: this.min_width, y: 0 }
            });
            var normalize_values = function (current_val) {
                var length_max_number = "".concat(parseInt(get_max_value)).length;
                var length_current_val = "".concat(current_val).length;
                var normalized_value = "".concat(current_val);
                if (length_max_number > length_current_val) {
                    var diff = length_max_number - length_current_val;
                    normalized_value = "".concat(Array.from({ length: diff }).map(function () { return 0; }).join('')).concat(current_val);
                }
                return normalized_value;
            };
            for (var i = 0; i < vertical_data.length; i++) {
                var position_y = interpolation(vertical_data[i], [0, get_max_value], [this.enable_height, 0]);
                this.draw_element({
                    color: '#fff',
                    coords: { h: 1, w: 7, x: this.min_width - 7, y: position_y }
                });
                this.draw_element({
                    color: '#ffffff',
                    text: {
                        content: "".concat(normalize_values(parseInt(vertical_data[i]))),
                        px: this.size_text,
                        aling: 'right',
                        coords: {
                            x: this.min_width - this.size_text,
                            y: position_y + (this.size_text - 3)
                        }
                    }
                });
                if (draw_xaxis) {
                    if (!dashed_enabled) {
                        this.draw_element({
                            color: '#ffffff2d',
                            coords: { h: 1, w: options.chart.width, x: this.min_width - 7, y: position_y }
                        });
                        continue;
                    }
                    var space_by = 5;
                    var w_dash = 5;
                    var loops_count = options.chart.width / ((w_dash + space_by));
                    var current_x_pos = this.min_width;
                    for (var z = 0; z < loops_count; z++) {
                        this.draw_element({
                            color: '#ffffff2d',
                            coords: { h: 1, w: w_dash, x: current_x_pos, y: position_y }
                        });
                        current_x_pos += (w_dash + space_by);
                    }
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
                    var is_left = column.pos.x < middle_space_width ? true : false;
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
                            coords: { x: pos_x_base + padding, y: pos_y_base + 18 }
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
                                coords: { x: pos_x_base + 20, y: pos_y_labels - padding }
                            }
                        });
                        ctx.fillStyle = (_a = options.series[i]) === null || _a === void 0 ? void 0 : _a.color;
                        ctx.beginPath();
                        ctx.arc(pos_x_base + padding, pos_y_labels - 15, 5, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.closePath();
                    }
                }
            }
        },
        define_min_side: function () {
            var w = options.chart.width;
            var h = options.chart.height;
            this.min_side_by_side = w < h ? w : h;
        },
        draw_arc: function (props) {
            var convert_degree_rad = function (val) { return val * (Math.PI / 180); };
            ctx.beginPath();
            ctx.lineWidth = props.line_width;
            ctx.strokeStyle = props.color;
            ctx.arc(props.x, props.y, props.radius_size, convert_degree_rad(props.initial), convert_degree_rad(props.final));
            ctx.stroke();
            ctx.closePath();
        },
        interpolated_pie: function () {
            var _a;
            var arc_data = [];
            var max_value_chart = options.series.reduce(function (acc, data) { return acc += data.data[0]; }, 0);
            for (var _i = 0, _b = options.series; _i < _b.length; _i++) {
                var current_data = _b[_i];
                var arc_current = {};
                var width = interpolation(current_data.data[0], [0, max_value_chart], [20, 70]);
                var final_degree = interpolation(current_data.data[0], [0, max_value_chart], [0, 360]);
                arc_current.width = width;
                arc_current.color = current_data.color,
                    arc_current.inital = ((_a = arc_data[arc_data.length - 1]) === null || _a === void 0 ? void 0 : _a.final) || 0;
                arc_current.final = arc_current.inital + final_degree;
                arc_data.push(arc_current);
            }
            var high_radius = arc_data.reduce(function (acc, val) { return acc > val.width ? acc : val.width; }, 0);
            for (var _c = 0, arc_data_1 = arc_data; _c < arc_data_1.length; _c++) {
                var arc = arc_data_1[_c];
                this.draw_arc({
                    color: arc.color,
                    final: arc.final,
                    initial: arc.inital,
                    x: options.chart.width / 2,
                    y: options.chart.height / 2,
                    line_width: arc.width,
                    radius_size: (this.min_side_by_side / 2) - (high_radius / 2)
                });
            }
        },
        pie_lines: function () {
            var space_by_line = 6;
            var line_width = 10;
            for (var i = 0; i < options.series.length; i++) {
                var current_serie = options.series[i];
                var convert_to = this.get_rgb_color(current_serie.color);
                var radius = (this.min_side_by_side / 2) - (line_width / 2) - ((space_by_line + line_width) * i);
                var current_arc_data = {
                    color: "rgb(".concat(convert_to === null || convert_to === void 0 ? void 0 : convert_to.r, ", ").concat(convert_to === null || convert_to === void 0 ? void 0 : convert_to.g, ", ").concat(convert_to === null || convert_to === void 0 ? void 0 : convert_to.b, ", 0.1)"),
                    x: options.chart.width / 2,
                    y: options.chart.height / 2,
                    line_width: line_width,
                    initial: 0,
                    final: 360,
                    radius_size: radius
                };
                this.draw_arc(current_arc_data);
                var final_degree = interpolation(current_serie.data[0], [0, 100], [0, 360]);
                current_arc_data.color = current_serie.color;
                current_arc_data.final = final_degree;
                this.draw_arc(current_arc_data);
            }
        }
    };
    var draw_everything = function () {
        ctx.clearRect(0, 0, options.chart.width, options.chart.height);
        chart.define_min_side();
        if (options.chart.type === 'pie_lines') {
            chart.pie_lines();
        }
        if (options.chart.type === 'pie_interpolated') {
            chart.interpolated_pie();
        }
        if (options.chart.type === 'normal') {
            if (!(options === null || options === void 0 ? void 0 : options.disable_sparklines)) {
                chart.draw_side_left_height_data();
                chart.draw_activate_hover_columns();
                chart.draw_base_chart();
                chart.draw_spikes();
            }
            chart.draw_columns();
            if (!(options === null || options === void 0 ? void 0 : options.disable_sparklines))
                chart.draw_tooltip();
        }
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
    var data_is_ok = check_data_integrity();
    if (!data_is_ok._success)
        console.error(data_is_ok.message);
    if (data_is_ok._success) {
        draw_everything();
        canvas.addEventListener('mousemove', on_mouse_move);
        canvas.addEventListener('mouseout', disable_all_columns);
    }
    var destroy_canvas_listeners = function () {
        canvas.removeEventListener('mousemove', on_mouse_move);
        canvas.removeEventListener('mouseout', disable_all_columns);
    };
    return { destroy: destroy_canvas_listeners };
};
