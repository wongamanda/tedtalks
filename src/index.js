// if the data you are going to import is small, then you can import it using es6 import
// import MY_DATA from './app/data/example.json'
// (I tend to think it's best to use screaming snake case for imported json)
const domReady = require('domready');
import {select} from 'd3-selection';
import {scaleOrdinal} from 'd3-scale';
import {schemeSet3} from 'd3-scale-chromatic';
import {treemap, treemapBinary} from 'd3';
import {csv} from 'd3-fetch';
import {hierarchy} from 'd3-hierarchy';
import {mainTag, calculateSentiments, groupBy} from './utils.js';

domReady(() => {
  // this is just one example of how to import data. there are lots of ways to do it!
  csv('./data/ted_main.csv')
    .then(data => myVis(data));
});

function myVis(data, test) {

  const sentiments = [
    'Inspiring',
    'Informative',
    'Fascinating',
    'Beautiful',
    'Funny',
    'OK'
  ];
  const themeData = ['technology', 'science', 'global issues', 'culture',
    'design', 'business', 'entertainment', 'health', 'innovation'];

  const width = 5000 / 3;
  const height = ((24 / 36) * 5000) / 3;

  const margin = {top: 10, left: 10, right: 10, bottom: 10};
  const padding = 15;
  const legendWidth = width - margin.left - margin.right;
  const legendHeight = height / 3 - margin.top - margin.bottom;
  const plotWidth = width - legendHeight - margin.left - margin.right;
  const plotHeight = height - margin.left - margin.top - 80;

  // DATA PROCESSING
  const taggedData = mainTag(data, 'tags', themeData, sentiments);
  const groupedData = groupBy(taggedData, 'tag');
  const finalData = calculateSentiments(groupedData, sentiments);

  // SET-UP
  const colorScaleSentiments = scaleOrdinal()
    .domain(sentiments)
    .range(schemeSet3);

  // CREATE SVG
  const svg = select('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'treeContainer');

  // TITLE
  buildTitle(svg, plotWidth, 80, padding);

  // DRAWING TREEMAP
  const treemapEval = treemap()
    .tile(treemapBinary)
    .size([plotWidth, plotHeight])
    .round(true)
    .paddingOuter(padding + 5)
    .paddingInner(padding / 2);

  const formattedTree = {
    name: 'root',
    children: finalData
  };
  const rootnode = hierarchy(formattedTree)
   .sum(d => d.proportion)
   .sort((a, b) => (b.height - a.height || b.value - a.value));

  treemapEval(rootnode);

  const cell = svg.selectAll('g')
      .data(rootnode.descendants())
      .enter().append('g')
      .attr('transform', d => {
        return 'translate('.concat(d.x0, ', ', (d.y0 + 80), ')');
      });

  cell.append('rect')
    .attr('class', d => {
      if (d.parent) {
        return d.parent.data.name.concat('.', d.data.name);
      }
      return 'TED Talks';
    })
    .attr('width', d => margin.left + d.x1 - d.x0)
    .attr('height', d => margin.top + d.y1 - d.y0)
    .attr('style', d => {
      if (!d.data.sentimento && d.data.name !== 'root') {
        return 'stroke-width:2;stroke:rgb(211,211,211)';
      }
      return 'stroke-width:0;stroke:rgb(0,0,0)';
    })
    .attr('fill', (d, i) =>
      d.depth === 2 ? colorScaleSentiments(d.data.name) : 'None');

  cell.append('text')
    .attr('x', d => d.depth === 2 ? 4 : 22)
    .attr('y', d => d.depth === 2 ? 25 : 17)
    .attr('font-family', 'Courier New')
    .style('font-size', d => d.depth === 2 ? '14px' : '16px')
    .style('font-weight', d => d.depth === 2 ? 'bold' : 'bolder')
    .attr('fill', 'black')
    .text(d => {
      if (d.depth !== 2 && d.data.name !== 'root') {
        return d.data.name.replace(/\'/g, '');
      } else if (d.depth === 2) {
        return ''.concat(d.data.catProportion, '%');
      }
      return '';
    });

  cell.append('text')
      .attr('x', 4)
      .attr('y', 25 + 20)
      .attr('font-family', 'monospace')
      .style('font-size', '16px')
      .style('font-weight', 'normal')
      .style('font-style', 'italic')
      .attr('fill', 'black')
      .text((d, i) => {
        if (i > 9 && i < 16) {
          return d.data.name;
        }
      });
  // LEGEND

  buildLegend(plotWidth, legendWidth, legendHeight, plotHeight, sentiments, colorScaleSentiments);

}
/** build a title for the visualization
 * parameters:
 * svg: the svg object
 * plotWidth: the width of the plot
 * titleHeight: how much height is allocated to the title
 * padding: how much padding to use around the text
 **/
function buildTitle(svg, plotWidth, titleHeight, padding) {
  svg.append('text')
      .attr('transform', 'translate(10, 10)')
      .attr('x', plotWidth / 2)
      .attr('y', titleHeight / 2 + padding)
      .attr('font-family', 'Courier, Bookman, Arial, sans-serif')
      .style('font-size', '50px')
      .style('text-anchor', 'middle')
      .attr('fill', 'black')
      .text('Let\'s Talk Feelings about TED Talks');

}
/** build a legend that connects sentiments to color, explains the nesting
 * and how to read the graph
 * parameters:
 * plotWidth: the width of the plot
 * legendWidth: the width of the legend
 * legendHeight: the height of the legend

 * plotHeight: the height of the plot
 * sentiments: the list of sentiments to make a key for
 * colorScaleSentiments: the colors used to encode sentiment
 **/
function buildLegend(plotWidth, legendWidth, legendHeight, plotHeight, sentiments, colorScaleSentiments) {
  const legend = select('svg').append('g')
    .attr('transform',
    'translate('.concat((plotWidth + 10), ', ', (80 + 2 * 10), ')'))
    .attr('width', legendWidth)
    .attr('height', legendHeight);

  legend.selectAll('rect')
    .data(sentiments)
    .enter().append('rect')
      .attr('x', 0)
      .attr('y', (d, i) => i * 40)
      .attr('width', 35)
      .attr('height', 35)
      .attr('fill', d => colorScaleSentiments(d))
      .attr('class', 'legend');

  legend.selectAll('text')
    .data(sentiments)
    .enter().append('text')
      .attr('x', 50)
      .attr('y', (d, i) => i * 40 + 20)
      .attr('font-family', 'monospace')
      .style('font-size', '15px')
      .attr('fill', 'black')
      .text(d => d);

  legend.selectAll('rect')
    .data(sentiments)
    .enter().append('rect')
      .attr('x', 0)
      .attr('y', (d, i) => i * 40)
      .attr('width', 40)
      .attr('height', 40)
      .attr('fill', d => colorScaleSentiments(d))
      .attr('class', 'legend');

  buildParagraph(legend, plotHeight);

  legend.append('text')
    .attr('x', 0)
    .attr('y', 5 * 40 + 130)
    .attr('font-family', 'monospace')
    .style('font-size', '22px')
    .attr('fill', 'black')
    .text('How to read this graph:');

  legend.append('text')
    .attr('x', 0)
    .attr('y', 5 * 40 + 160)
    .attr('font-family', 'Arial')
    .style('font-size', '14px')
    .text('Colored boxes are scaled proportionally to the # of ');

  legend.append('text')
    .attr('x', 0)
    .attr('y', 5 * 40 + 5 + 180)
    .attr('font-family', 'Arial')
    .style('font-size', '14px')
    .text('\'votes\' a sentiment received within a TED Talk theme ');

  legend.append('text')
    .attr('x', 0)
    .attr('y', 5 * 40 + 210)
    .attr('font-family', 'Arial')
    .style('font-size', '14px')
    .text('and the # of videos in each theme.');

  legend.append('text')
    .attr('x', 0)
    .attr('y', 5 * 40 + 235)
    .attr('font-family', 'Arial')
    .style('font-size', '14px')
    .style('font-style', 'italic')
    .text('Note: Not all sentiments and themes are represented.');

}
function buildParagraph(legend, plotHeight) {

  legend.append('text')
    .attr('x', 0)
    .attr('y', plotHeight / 1.75 + 0)
    .attr('font-family', 'monospace')
    .style('font-size', '22px')
    .attr('fill', 'black')
    .text('About this graph:');

  legend.append('text')
    .attr('x', 0)
    .attr('y', plotHeight / 1.75 + 25)
    .attr('font-family', 'Arial')
    .style('font-size', '14px')
    .text('Viewers can select from a pre-set list of');

  legend.append('text')
    .attr('x', 0)
    .attr('y', plotHeight / 1.75 + 50)
    .attr('font-family', 'Arial')
    .style('font-size', '14px')
    .text('sentiments when they watch a TED Talk to denote');

  legend.append('text')
    .attr('x', 0)
    .attr('y', plotHeight / 1.75 + 75)
    .attr('font-family', 'Arial')
    .style('font-size', '14px')
    .text('how it made them feel. Viewers can vote for more');

  legend.append('text')
    .attr('x', 0)
    .attr('y', plotHeight / 1.75 + 100)
    .attr('font-family', 'Arial')
    .style('font-size', '14px')
    .text('than one. We chose the six most popular sentiments ');

  legend.append('text')
    .attr('x', 0)
    .attr('y', plotHeight / 1.75 + 125)
    .attr('font-family', 'Arial')
    .style('font-size', '14px')
    .text('and the eight most popular TED Talk themes, and ');

  legend.append('text')
      .attr('x', 0)
      .attr('y', plotHeight / 1.75 + 150)
      .attr('font-family', 'Arial')
      .style('font-size', '14px')
      .text('calculated the percentage that each of the six ');

  legend.append('text')
      .attr('x', 0)
      .attr('y', plotHeight / 1.75 + 175)
      .attr('font-family', 'Arial')
      .style('font-size', '14px')
      .text('sentiments received for those themes. The videos');

  legend.append('text')
    .attr('x', 0)
    .attr('y', plotHeight / 1.75 + 200)
    .attr('font-family', 'Arial')
    .style('font-size', '14px')
    .text(' are organized by theme (gray boxes), and then by ');

  legend.append('text')
    .attr('x', 0)
    .attr('y', plotHeight / 1.75 + 225)
    .attr('font-family', 'Arial')
    .style('font-size', '14px')
    .text('sentiments (colored boxes).');

}
