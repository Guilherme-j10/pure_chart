type OptionsType = {
  canvas: string,
  label_tip?: string,
  series: Array<{
    data_label: string,
    color?: string,
    data_type: string,
    data: number[]
  }>,
  colors: string[],
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

  const chart = {
    line_base_height: options.chart.height - 25,
    size_text: 11,
    size_text_tip: 13,
    current_labels: [] as string[],
    chart_column_pos: [] as ChartColumnPos[],
    draw_element(load: DrawElementTypes) {

      ctx.fillStyle = load.color;

      ctx.shadowColor = '#1111119e';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      if (!Object.keys(load?.text || {}).length && Object.keys(load?.coords || {}).length)
        ctx.fillRect(
          load.coords?.x as number,
          load.coords?.y as number,
          load.coords?.w as number,
          load.coords?.h as number
        );

      if (Object.keys(load?.text || {}).length) {

        ctx.font = `${load.text?.px}px Arial`;
        ctx.textAlign = load.text?.aling || 'center';
        ctx.fillText(
          load.text?.content as string,
          load.text?.coords.x as number,
          load.text?.coords.y as number
        );

      }

    },
    draw_base_chart() {

      this.draw_element({
        color: '#ffffff2d',
        coords: { h: 1.5, w: options.chart.width, x: 0, y: this.line_base_height }
      })

    },
    draw_spikes() {

      const calculate_spikes = options.chart.width / options.series[0].data.length;

      for (let i = 0; i < options.series[0].data.length; i++) {

        const initial_point = calculate_spikes * i;
        const middle = initial_point + (calculate_spikes / 2);
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
    draw_columns() {

      const get_columns = options.series.filter(data => data.data_type === 'column');
      const calc_spikes_pos = options.chart.width / options.series[0].data.length;
      const diff_from_base = Math.abs(options.chart.height - this.line_base_height);

      const padding_space = interpolation(options.series.length, [0, 1000], [5, 30]);
      const complete_column_width = calc_spikes_pos - padding_space;
      const space_by_each_column = Math.abs(complete_column_width / get_columns.length);

      const get_lines = options.series.filter(data => data.data_type === 'line');

      const enabled_max_height = options.chart.height - diff_from_base - 10;
      const max_height = this.calculate_max_val();

      for (let x = 0; x < options.series[0].data.length; x++) {

        const initial_point = calc_spikes_pos * x;
        const initial_point_more_padding = initial_point + (padding_space / 2);
        let start_point = initial_point_more_padding;

        this.chart_column_pos.push({
          index: x,
          is_activate: false,
          pos: { x: initial_point, y: 0, h: enabled_max_height, w: calc_spikes_pos }
        });

        for (let z = 0; z < get_columns.length; z++) {

          const chart_height_column = interpolation(options.series[z].data[x], [0, max_height], [2, enabled_max_height]);

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

      for (let i = 0; i < get_lines.length; i++) {

        let coords_of_line = [];

        for (let y = 0; y < get_lines[i].data.length; y++) {

          const chart_height_column = interpolation(get_lines[i].data[y], [0, max_height], [0, enabled_max_height]);
          const calc_y = Math.abs(chart_height_column - enabled_max_height);

          const pinter_x = calc_spikes_pos * y;
          const middle_pointer_x = pinter_x + (calc_spikes_pos / 2);

          coords_of_line.push({ x: middle_pointer_x, y: calc_y });

        }

        ctx.strokeStyle = get_lines[i].color as string;
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(0, enabled_max_height);

        for (const coord of coords_of_line) {

          ctx.lineTo(coord.x, coord.y);

        }

        ctx.lineTo(options.chart.width, enabled_max_height);
        ctx.stroke();

        for (const coord of coords_of_line) {

          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(coord.x, coord.y, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.closePath();

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
    draw_tooltip() {

      const max_length = (options.series.map(data => data.data_label.length * this.size_text_tip))
        .reduce((acc, val) => acc > val ? acc : val, 0);

      for (const column of this.chart_column_pos) {

        if (column.is_activate) {

          const middle_space_width = options.chart.width / 2;
          const is_left = column.pos.x < middle_space_width ? true : false; //the rendering pointer is to the left in relation to the total half of the canvas
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
              coords: { x: pos_x_base + 10, y: pos_y_base + 18 }
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
                coords: { x: pos_x_base + 20, y: pos_y_labels - 10 }
              }
            });

            ctx.fillStyle = options.series[i]?.color || options.colors[i];
            ctx.beginPath();
            ctx.arc(pos_x_base + 10, pos_y_labels - 15, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();

          }

        }

      }

    }
  }

  const draw_everything = () => {

    ctx.clearRect(0, 0, options.chart.width, options.chart.height);

    chart.draw_activate_hover_columns();
    chart.draw_base_chart();
    chart.draw_spikes();
    chart.draw_columns();
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

  canvas.addEventListener('mousemove', on_mouse_move);
  canvas.addEventListener('mouseout', disable_all_columns);

  const destroy_canvas_listeners = () => {

    canvas.removeEventListener('mousemove', on_mouse_move);
    canvas.removeEventListener('mouseout', disable_all_columns);

  }

  draw_everything();

  return { destroy: destroy_canvas_listeners }

}