type OptionsType = {
  canvas: string,
  label_tip?: string,
  series: Array<{
    data_label: string,
    color: string,
    data_type: string,
    data: number[]
  }>,
  enable_data_dots?: boolean,
  stroke_line_settings?: {
    width: number,
    fill?: boolean,
    fill_color?: string
  },
  disable_sparklines?: boolean,
  smooth?: boolean,
  hermit_enable?: boolean
  labels?: string[],
  chart: {
    width: number,
    height: number
  }
}

type ChartType = {
  destroy: () => void
}

type ChartColumnPos = {
  pos: { x: number, y: number, h: number, w: number },
  index: number,
  is_activate: boolean
}

type DrawElementTypes = {
  color: string,
  text?: {
    content: string,
    aling?: 'center' | 'left' | 'right'
    px: number,
    coords: {
      x: number,
      y: number
    }
  },
  coords?: {
    w: number,
    h: number,
    x: number,
    y: number
  }
}

const initialize_chart = (options: OptionsType): ChartType => {

  const canvas = document.getElementById(options.canvas) as HTMLCanvasElement;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  canvas.width = options.chart.width;
  canvas.height = options.chart.height;

  const interpolation = (value: number, input: number[], output: number[]): number => {

    return output[0] + (((value - input[0]) / (input[1] - input[0])) * (output[1] - output[0]))

  }

  const check_data_integrity = (): boolean => {

    const amount_data = options.series[0].data.length;
    let success = true;

    for (const data of options.series) {

      if (data.data.length === amount_data) continue;

      success = false;
      break;

    }

    if (success && !amount_data) {

      for (let i = 0; i < options.series.length; i++) {

        options.series[i].data = Array.from({ length: 12 }).map(() => 0);

      }

    }

    return success;

  }

  const default_stroke_width = (options?.stroke_line_settings?.width || 3);

  const chart = {
    line_base_height: options.chart.height - 25,
    size_text: 11,
    size_text_tip: 13,
    padding_top: 22,
    margin_borders: 10,
    default_stroke_style: {
      width: default_stroke_width,
    },
    enable_height: (options?.disable_sparklines || false) ?
      options.chart.height - default_stroke_width : 0,
    min_width: options?.disable_sparklines ? 0 : 30,
    current_labels: [] as string[],
    chart_column_pos: [] as ChartColumnPos[],
    chart_data_preset_validation() {

      let _success = true;
      const get_all_colors = options.series.map(data => data.color);

      for (const color of get_all_colors) {

        const removed_prefix = color.split('#')[1];

        if (removed_prefix.length === 6) continue;

        _success = false;

      }

      //verifica a estrutura de dados passando para poder formar o grafico

      return _success

    },
    draw_element(load: DrawElementTypes) {

      ctx.beginPath();
      ctx.fillStyle = load.color;

      ctx.shadowColor = '#1111119e';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      if (!Object.keys(load?.text || {}).length && Object.keys(load?.coords || {}).length) {

        ctx.fillRect(
          load.coords?.x as number,
          load.coords?.y as number,
          load.coords?.w as number,
          load.coords?.h as number
        );

      }

      if (Object.keys(load?.text || {}).length) {

        ctx.font = `${load.text?.px}px Arial`;
        ctx.textAlign = load.text?.aling || 'center';
        ctx.fillText(
          load.text?.content as string,
          load.text?.coords.x as number,
          load.text?.coords.y as number
        );

      }

      ctx.closePath();

    },
    draw_base_chart() {

      this.draw_element({
        color: '#ffffff2d',
        coords: { h: 1.5, w: options.chart.width - this.min_width, x: this.min_width, y: this.line_base_height }
      })

    },
    draw_spikes() {

      const calculate_spikes = (options.chart.width - (this.min_width + this.margin_borders)) / options.series[0].data.length;

      for (let i = 0; i < options.series[0].data.length; i++) {

        const initial_point = calculate_spikes * i;
        const middle = initial_point + (calculate_spikes / 2) + (this.min_width + this.margin_borders);
        const label_content = options?.labels?.length ? options.labels[i] : `${i + 1}`;

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
        })

        this.current_labels.push(label_content)

      }

    },
    calculate_max_val() {

      let max_values = [] as number[];

      for (const data_series of options.series) {

        const max_value_of = data_series.data.reduce((acc, val) => acc > val ? acc : val, 0);
        max_values.push(max_value_of);

      }

      return max_values.reduce((acc, val) => acc > val ? acc : val, 0);

    },
    get_rgb_color(hex: string) {

      let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;

    },
    draw_columns() {

      const enable_stroke_bars = true;
      const get_columns = options.series.filter(data => data.data_type === 'column');
      const calc_spikes_pos = (options.chart.width - (this.min_width + this.margin_borders)) / options.series[0].data.length;

      const padding_space = interpolation(options.series.length, [0, 50], [5, 30]);
      const complete_column_width = calc_spikes_pos - padding_space;
      const space_by_each_column = Math.abs((complete_column_width + (enable_stroke_bars ? this.default_stroke_style.width : 0)) / get_columns.length);

      const get_lines = options.series.filter(data => data.data_type === 'line');

      //const max_enabled_value = this.calculate_max_value_enabled();
      const max_height = this.calculate_max_val();//max_enabled_value.get_max_value;

      for (let x = 0; x < options.series[0].data.length; x++) {

        const initial_point = (calc_spikes_pos * x) + this.min_width + this.margin_borders;
        const initial_point_more_padding = initial_point + (padding_space / 2);
        let start_point = initial_point_more_padding;

        this.chart_column_pos.push({
          index: x,
          is_activate: false,
          pos: { x: initial_point, y: 0, h: this.enable_height, w: calc_spikes_pos }
        });

        for (let z = 0; z < get_columns.length; z++) {

          const chart_height_column = interpolation(options.series[z].data[x], [0, max_height], [2, this.enable_height - (padding_space / 2)]);

          if (enable_stroke_bars) {

            const h = chart_height_column;
            const w = space_by_each_column - this.default_stroke_style.width;
            const x = start_point;
            const y = Math.abs(this.enable_height - chart_height_column);

            ctx.beginPath();

            const rgb = this.get_rgb_color(options.series[z].color);
            ctx.fillStyle = `rgb(${rgb?.r}, ${rgb?.g}, ${rgb?.b}, .2)`;
            ctx.strokeStyle = options.series[z].color;
            ctx.lineWidth = this.default_stroke_style.width;

            ctx.moveTo(x, y);

            ctx.lineTo((x + w), y);
            ctx.lineTo((x + w), (y + h));
            ctx.lineTo(x, (y + h));
            ctx.lineTo(x, y - 1);

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

      for (let i = 0; i < get_lines.length; i++) {

        let coords_of_line = [];

        for (let y = 0; y < get_lines[i].data.length; y++) {

          const chart_height_column = interpolation(get_lines[i].data[y], [0, max_height], [0, this.enable_height - 5]);
          const calc_y = Math.abs(chart_height_column - this.enable_height);

          const pinter_x = calc_spikes_pos * y;
          const middle_pointer_x = pinter_x + (calc_spikes_pos / 2);

          coords_of_line.push({ x: middle_pointer_x + (this.min_width + this.margin_borders), y: calc_y });

        }

        ctx.strokeStyle = get_lines[i].color as string;
        ctx.lineWidth = this.default_stroke_style.width;

        const is_spline_cubic = !options?.hermit_enable ? true : false;

        ctx.beginPath();
        ctx.moveTo((this.min_width + this.margin_borders), this.enable_height);

        if (options?.smooth) {

          coords_of_line.unshift({ x: (this.min_width + this.margin_borders), y: this.enable_height });
          coords_of_line.unshift({ x: (this.min_width + this.margin_borders), y: this.enable_height });
          coords_of_line.push({ x: options.chart.width, y: this.enable_height });

          const hermit_interpolation = (x: number, x1: number, y1: number, x2: number, y2: number): number => {

            var t = (x - x1) / (x2 - x1);

            var h00 = 1 - 3 * t ** 2 + 2 * t ** 3;
            var h01 = 3 * t ** 2 - 2 * t ** 3;

            return h00 * y1 + h01 * y2;

          }

          if (!is_spline_cubic) {

            for (let x = 0; x < coords_of_line.length - 1; x += 1) {

              const p1 = coords_of_line[x];
              const p2 = coords_of_line[x + 1];

              let current_x = p1.x;
              let steps = 0.1;

              while (current_x <= p2.x) {

                current_x += steps;

                const current_y = hermit_interpolation(current_x, p1.x, p1.y, p2.x, p2.y);

                ctx.lineTo(current_x, current_y);

              }

            }

          }

          if (is_spline_cubic) {

            const reorganize_points = (coords: Array<{ x: number, y: number }>) => {

              let reorganized = [];

              for (let x = 0; x < coords.length - 1; x += 1) {

                reorganized.push([
                  coords[x],
                  coords[x + 1],
                  coords[x + 2]
                ])

              }

              return reorganized;

            }

            const points = reorganize_points(coords_of_line);

            const get_control_points = (x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, t: number): number[] => {

              const d1 = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
              const d2 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

              const fa = t * d1 / (d1 + d2);
              const fb = t * d2 / (d1 + d2);

              const p1x = x1 - fa * (x2 - x0);
              const p1y = y1 - fa * (y2 - y0);
              const p2x = x1 + fb * (x2 - x0);
              const p2y = y1 + fb * (y2 - y0);

              return [p1x, p1y, p2x, p2y];

            }

            const tension = 0.35;

            for (let i = 0; i < points.length - 1; i++) {

              const p1_1 = points[i][0];
              const p1_c = points[i][1];
              const p1_2 = points[i][2] || { x: options.chart.width, y: this.enable_height };

              const p2_1 = points[i + 1][0];
              const p2_c = points[i + 1][1];
              const p2_2 = points[i + 1][2] || { x: options.chart.width, y: this.enable_height };

              let [cp1_1x, cp1_1y, cp1_2x, cp1_2y] = get_control_points(p1_1.x, p1_1.y, p1_c.x, p1_c.y, p1_2.x, p1_2.y, tension);
              let [cp2_1x, cp2_1y, cp2_2x, cp2_2y] = get_control_points(p2_1.x, p2_1.y, p2_c.x, p2_c.y, p2_2.x, p2_2.y, tension);

              if (p1_c.y === p1_2.y && p1_c.y === this.enable_height) {

                cp2_1y = p1_c.y;
                cp1_2y = p1_c.y;

              } else {

                const limit_curve_on_base = (y: number) => {

                  const limit = 20;

                  if (y > (this.enable_height - limit) && y < this.enable_height) return true;

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

                } else {

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

        if (!options?.smooth) {

          for (const coord of coords_of_line) {

            ctx.lineTo(coord.x, coord.y);

          }

          ctx.lineTo(options.chart.width, this.enable_height);

        }

        ctx.stroke();

        if (options?.stroke_line_settings?.fill) {

          if (options?.stroke_line_settings?.fill_color)
            ctx.fillStyle = options?.stroke_line_settings?.fill_color;

          ctx.fill();

        }

        ctx.closePath();

        const dots_enable = typeof options.enable_data_dots === 'undefined' ? true : options.enable_data_dots;

        if (dots_enable) {

          for (const coord of coords_of_line) {

            if (
              coord.x <= 0 ||
              coord.x >= options.chart.width ||
              coord.x === this.margin_borders ||
              coord.x === (this.min_width + this.margin_borders)
            ) continue;

            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(coord.x, coord.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();

          }

        }

      }

    },
    draw_activate_hover_columns() {

      for (const column of this.chart_column_pos) {

        if (column.is_activate) {

          this.draw_element({
            color: '#ffffff2d',
            coords: { h: column.pos.h, w: column.pos.w, x: column.pos.x, y: column.pos.y }
          });

        }

      }

    },
    calculate_max_value_enabled() {

      const min_space = 25;
      let get_max_value = (this.calculate_max_val()) || 10;
      const loops = (this.enable_height) / min_space;
      let increaser = get_max_value / loops;
      let vertical_data = [0];

      for (let x = 0; x < loops; x++)
        vertical_data.push(vertical_data[vertical_data.length - 1] + increaser);

      get_max_value = vertical_data.reduce((acc, val) => acc > val ? acc : val, 0);

      return { get_max_value, vertical_data };

    },
    draw_side_left_height_data() {

      const draw_xaxis = true;
      const dashed_enabled = true;
      const diff_from_base = Math.abs(options.chart.height - this.line_base_height);
      this.enable_height = options.chart.height - diff_from_base - this.margin_borders;

      const { get_max_value, vertical_data } = this.calculate_max_value_enabled();

      this.min_width = (`${parseInt(get_max_value as any)}`.length * this.size_text) + (this.size_text / 2);

      this.draw_element({
        color: '#ffffff2d',
        coords: { w: 1.5, h: this.enable_height + this.margin_borders, x: this.min_width, y: 0 }
      });

      const normalize_values = (current_val: number) => {

        const length_max_number = `${parseInt(get_max_value as any)}`.length;
        const length_current_val = `${current_val}`.length;
        let normalized_value = `${current_val}`;

        if (length_max_number > length_current_val) {

          const diff = length_max_number - length_current_val;
          normalized_value = `${Array.from({ length: diff }).map(() => 0).join('')}${current_val}`

        }

        return normalized_value;

      }

      for (let i = 0; i < vertical_data.length; i++) {

        const position_y = interpolation(
          vertical_data[i],
          [0, get_max_value],
          [this.enable_height, 0]
        );

        this.draw_element({
          color: '#fff',
          coords: { h: 1, w: 7, x: this.min_width - 7, y: position_y }
        });

        this.draw_element({
          color: '#ffffff',
          text: {
            content: `${normalize_values(parseInt(vertical_data[i] as any))}`,
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

          const space_by = 5;
          const w_dash = 5;
          const loops_count = options.chart.width / ((w_dash + space_by));
          let current_x_pos = this.min_width;

          for (let z = 0; z < loops_count; z++) {

            this.draw_element({
              color: '#ffffff2d',
              coords: { h: 1, w: w_dash, x: current_x_pos, y: position_y }
            });

            current_x_pos += (w_dash + space_by);

          }

        }

      }

    },
    draw_tooltip() {

      const max_length = (options.series.map(data => data.data_label.length * this.size_text_tip))
        .reduce((acc, val) => acc > val ? acc : val, 0);

      for (const column of this.chart_column_pos) {

        if (column.is_activate) {

          const middle_space_width = options.chart.width / 2;
          const is_left = column.pos.x < middle_space_width ? true : false;
          const min_height_by_line = 30;
          const padding = 10;

          const tip_w = max_length + (padding * 2);
          const tip_h = (min_height_by_line + (options.series.length * min_height_by_line)) + 1;

          const pos_x_base = is_left ? (column.pos.x + column.pos.w) + 10 : (column.pos.x - tip_w) - 10;
          const pos_y_base = (column.pos.h / 2) - (tip_h / 2);

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
              content: `${options.label_tip}${this.current_labels[column.index]}`,
              px: this.size_text_tip,
              coords: { x: pos_x_base + padding, y: pos_y_base + 18 }
            }
          });

          let pos_y_labels = pos_y_base + min_height_by_line;

          for (let i = 0; i < options.series.length; i++) {

            pos_y_labels += min_height_by_line;

            this.draw_element({
              color: 'rgb(255,255,255,.1)',
              coords: { h: 1, w: tip_w, x: pos_x_base, y: pos_y_labels }
            });

            this.draw_element({
              color: 'rgb(255,255,255)',
              text: {
                aling: 'left',
                content: `${options.series[i].data_label}: ${options.series[i].data[column.index]}`,
                px: this.size_text_tip,
                coords: { x: pos_x_base + 20, y: pos_y_labels - padding }
              }
            });

            ctx.fillStyle = options.series[i]?.color;
            ctx.beginPath();
            ctx.arc(pos_x_base + padding, pos_y_labels - 15, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();

          }

        }

      }

    }
  }

  const draw_everything = () => {

    ctx.clearRect(0, 0, options.chart.width, options.chart.height);

    if (!options?.disable_sparklines) {

      chart.draw_side_left_height_data();
      chart.draw_activate_hover_columns();
      chart.draw_base_chart();
      chart.draw_spikes();

    }

    chart.draw_columns();

    if (!options?.disable_sparklines)
      chart.draw_tooltip();

  }

  const disable_all_columns = () => {

    for (const column of chart.chart_column_pos)
      chart.chart_column_pos[column.index] = {
        ...chart.chart_column_pos[column.index],
        is_activate: false
      }

    draw_everything();

  }

  const on_mouse_move = (event: MouseEvent) => {

    const cx = event.offsetX;

    for (const column of chart.chart_column_pos) {

      if (cx > column.pos.x && cx < (column.pos.x + column.pos.w)) {

        chart.chart_column_pos[column.index] = {
          ...chart.chart_column_pos[column.index],
          is_activate: true
        }

        continue;

      }

      chart.chart_column_pos[column.index] = {
        ...chart.chart_column_pos[column.index],
        is_activate: false
      }

    }

    draw_everything();

  }

  const data_is_ok = check_data_integrity();
  const chart_data_preset_is_ok = chart.chart_data_preset_validation();
  
  if (!chart_data_preset_is_ok) console.error('Check your config');
  if (!data_is_ok) console.error('Check your provided data.')

  if (data_is_ok && chart_data_preset_is_ok) {

    draw_everything();

    canvas.addEventListener('mousemove', on_mouse_move);
    canvas.addEventListener('mouseout', disable_all_columns);

  }

  const destroy_canvas_listeners = () => {

    canvas.removeEventListener('mousemove', on_mouse_move);
    canvas.removeEventListener('mouseout', disable_all_columns);

  }

  return { destroy: destroy_canvas_listeners }

}