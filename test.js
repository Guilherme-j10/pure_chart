const initialize = (props) => {

  const size = 12;

  var options = {
    canvas: 'chart_canvas_1',
    smooth: true,
    disable_sparklines: false,
    label_tip: 'Dia: ',
    series: [
      {
        data_label: 'Saudação',
        data_type: 'column',
        color: '#ffffff',
        data: Array.from({ length: size }).map(() => Math.floor(Math.random() * 50))
      },
      {
        data_label: 'Propaganda',
        data_type: 'column',
        color: '#62a5d9',
        data: Array.from({ length: size }).map(() => Math.floor(Math.random() * 50))
      },
      {
        data_label: 'Notificação',
        data_type: 'column',
        color: '#dbd753',
        data: Array.from({ length: size }).map(() => Math.floor(Math.random() * 50))
      },
      {
        data_label: 'Encaminhamento',
        data_type: 'line',
        color: '#caf50a',
        data: Array.from({ length: size }).map(() => Math.floor(Math.random() * 50))
      },
      {
        data_label: 'Conversão',
        data_type: 'line',
        color: '#be45ff',
        data: Array.from({ length: size }).map(() => Math.floor(Math.random() * 120))
      }
    ],
    chart: {
      type: 'normal',
      width: 380,
      height: 250
    },
    ...props,
  };

  initialize_chart(options);

}

initialize();
initialize({ canvas: 'chart_canvas_2', smooth: false });
initialize({ canvas: 'chart_canvas_3', hermit_enable: true, hide_vertical_data_set: true });
initialize({ canvas: 'chart_canvas_4', disable_sparklines: true, enable_data_dots: false });

initialize({ 
  canvas: 'chart_canvas_5',
  disable_sparklines: true, 
  enable_data_dots: false,
  stroke_line_settings: {
    width: 2,
    fill: true,
    fill_color: '#33ff0018'
  },
  series: [
    {
      data_label: 'Conversão',
      data_type: 'line',
      color: '#33ff00',
      data: Array.from({ length: 20 }).map(() => Math.floor(Math.random() * 50))
    }
  ],
});

initialize({ 
  canvas: 'chart_canvas_6',
  disable_sparklines: true, 
  enable_data_dots: false,
  stroke_line_settings: {
    width: 2,
    fill: true,
    opacity_bar_enabled: true,
    fill_color: '#33ff0018'
  },
  series: [
    {
      data_label: 'Propaganda',
      data_type: 'column',
      color: '#fbe606',
      data: Array.from({ length: 15 }).map(() => Math.floor(Math.random() * 50))
    },
    {
      data_label: 'Propaganda',
      data_type: 'column',
      color: '#ffffff',
      data: Array.from({ length: 15 }).map(() => Math.floor(Math.random() * 50))
    },
    {
      data_label: 'Notificação',
      data_type: 'column',
      color: '#2be812',
      data: Array.from({ length: 15 }).map(() => Math.floor(Math.random() * 50))
    }
  ],
});

initialize({ 
  canvas: 'pie_2',
  chart: {
    type: 'pie',
    width: 380,
    height: 250
  },
});