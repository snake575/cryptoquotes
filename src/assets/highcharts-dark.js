const palette = {
  series: ['#f6a821', '#0F83C9', '#DB524B', '#1bbf89'],
  text: '#B2B2B2',
  contrastText: '#E5E5E5',
  disabledText: '#7f7f7f',
  border: '#242424',
  contrastBorder: '#474747',
}

export default {
  colors: palette.series,
  chart: {
    backgroundColor: 'none',
    // plotBorderColor: palette.border,
    // plotBorderWidth: 1,
    style: {
      fontFamily: 'droid-sans-mono, monaco, monospace',
      fontStyle: 'normal',
    },
  },
  title: {
    style: {
      color: palette.contrastText,
      fontSize: '18px',
    },
    align: 'left',
  },
  subtitle: {
    style: {
      color: palette.text,
    },
  },
  xAxis: {
    crosshair: {
      color: 'rgba(255,255,255,0.2)',
    },
    labels: {
      style: {
        color: palette.text,
      },
    },
    lineColor: palette.border,
    lineWidth: 1,
    gridLineColor: palette.border,
    gridLineWidth: 1,
    minorGridLineColor: palette.border,
    tickColor: palette.contrastText,
    tickLength: 8,
    tickWidth: 1,
    title: {
      style: {
        color: palette.text,
      },
    },
  },
  yAxis: {
    crosshair: {
      color: palette.contrastBorder,
    },
    labels: {
      style: {
        color: palette.text,
      },
    },
    // endOnTick: false,
    lineColor: palette.border,
    lineWidth: 1,
    gridLineColor: palette.border,
    gridLineWidth: 1,
    minorGridLineColor: palette.border,
    tickColor: palette.contrastText,
    tickLength: 8,
    tickWidth: 1,
    title: {
      style: {
        color: palette.text,
      },
    },
  },
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.80)',
    borderColor: palette.contrastBorder,
    borderRadius: 0,
    padding: 12,
    style: {
      color: palette.contrastText,
    },
  },
  plotOptions: {
    series: {
      marker: {
        lineColor: 'none',
      },
    },
    candlestick: {
      lineColor: '#C60606',
      color: '#9C0004',
      upLineColor: '#00B909',
      upColor: 'transparent',
    },
  },
  credits: {
    enabled: false,
  },
  labels: {
    style: {
      color: palette.text,
    },
  },
  // scroll charts
  rangeSelector: {
    buttonTheme: {
      fill: 'none',
      stroke: palette.border,
      'stroke-width': 1,
      r: 0,
      height: 14,
      padding: 4,
      style: {
        color: palette.text,
        fontSize: '10px',
      },
      states: {
        hover: {
          fill: 'none',
          stroke: palette.contrastText,
          style: {
            color: palette.contrastText,
          },
        },
        select: {
          fill: 'none',
          stroke: palette.contrastText,
          style: {
            color: palette.contrastText,
          },
        },
        disabled: {
          fill: 'none',
          style: {
            color: palette.disabledText,
          },
        },
      },
    },
    inputBoxBorderColor: palette.border,
    inputStyle: {
      backgroundColor: 'none',
      color: palette.text,
    },
    labelStyle: {
      color: palette.text,
    },
  },
  navigator: {
    handles: {
      backgroundColor: palette.border,
      borderColor: palette.text,
    },
    outlineColor: palette.contrastBorder,
    outlineWidth: 1,
    maskFill: 'rgba(255,255,255,0.1)',
    series: {
      color: 'transparent',
      lineColor: palette.text,
    },
    xAxis: {
      gridLineColor: palette.border,
    },
  },
  scrollbar: {
    enabled: false,
  },
}
