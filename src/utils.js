
/** find all the data with the given themes and arranges the nescessary columns**/
export function mainTag(data, accessorKey, tags, sentiments) {
  const mainTags = tags.reduce(function reducer(acc, row) {
    acc[row] = true;
    return acc;
  }, {});
  const filteredVids = data.filter(row =>
		row.tags.slice(1, row.tags.length - 1)
			.split(', ')
			.find(thing => mainTags[thing.slice(1, thing.length - 1)]));

  const splitVids = filteredVids.reduce((acc, elem) => {
    elem.tags.slice(1, elem.tags.length - 1)
			.split(', ')
      .forEach(tag => {
        if (mainTags[tag.replace(/\'/g, '')]) {
          acc.push({
            id: elem.description.slice(0, 4),
            tag,
            ratings: JSON.parse(elem.ratings.replace(/\'/g, '\"'))});
        }
      });
    return acc;
  }, []);
  return splitVids;
}
/** group the data by a key**/
export function groupBy(data, accesor) {
  return data.reduce((acc, row) => {
    if (!acc[row[accesor]]) {
      acc[row[accesor]] = [];
    }
    acc[row[accesor]].push(row);
    return acc;
  }, {});
}
/** calculates the proportion for each sentiment for each theme**/
export function calculateSentiments(groupedData, sentiments) {
	// for each grouped data/key,
	// for each sentiment, add to a total and then divide each by that total
  return Object.keys(groupedData).reduce((acc, key) => {
    const counts = {};
    let totalo = 0;
    let numVideos = 0;
    const cur = groupedData[key];
    cur.forEach(row => {
      numVideos += 1;
      row.ratings.forEach(rating => {
        if (!counts[rating.name]) {
          counts[rating.name] = 0;
        }
        counts[rating.name] += rating.count;
        if (sentiments.includes(rating.name)) {
          totalo = totalo + rating.count;
        }
      });
    });
    return acc.concat({
      name: key,
      children: Object.keys(counts).map(rowkey => {
        return {name: rowkey,
          catProportion: ((counts[rowkey] / totalo) * 100).toFixed(2),
          proportion: Math.round((counts[rowkey] / totalo) * numVideos * 8),
          sentimento: sentiments.includes(rowkey)
        };
      })
				.filter(i => i.sentimento)
    });
  }, []);
}
