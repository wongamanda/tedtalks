Data Vis 239
Spring 2018

# How do Ted Talks make us feel?

## Context and Purpose

Our visualization considers eleven years’ worth of Ted Talks videos, from June 2006 through
September 2017. We wanted to see how people reacted to talks in different categories. The purpose of this
visualization is to answer questions about the relationship between the categories of Ted Talks and the
sentiments that are evoked in people. The questions our visualization is designed to answer are:

1. For TED videos of a given theme, which sentiments are evoked more strongly than others?
2. Do viewers associate specific sentiments more strongly with videos of certain themes?

## Pre-Processing

**Selecting themes list** ​: We forked a Kaggle data analysis Jupyter Notebook that organized Ted Talk ‘tags’ (we refer to these as ​ themes ​) in descending order of number. We selected the top 9 themes from this list.

**Selecting sentiments list:** ​ Using the same Jupyter Notebook, we determined the most frequently used ‘ratings.’ We refer to these as ​ sentiments ​ since they connote viewers’ emotions. The top 5 sentiments

were ‘beautiful,’ ‘fascinating,’ ‘inspiring,’ ‘informative,’ and ‘funny’. We also included ‘ok’ to offset the
entirely positive aforementioned ones.
**Filtering by theme:** ​ mainTag in utils.js selects from a video’s list of associated themes the ones that
match our list. mainTag then projects the data into the necessary columns.
**Reducing and calculating:** ​ Grouping videos (groupBy) by theme was necessary to determining the
proportion of sentiments within each theme. calculateSentiments sums all votes a theme received. It then
divides each sentiment by this total, and reduces the data to the sentiments from our select list. We
normalized the number of votes in each theme to be relative to the number of videos, so the size of each
sentiment’s box is relative to the number of videos and maintains this relation across categories.

## How it works

A nested treemap displays the data of two depths. The videos are first classified by theme, of which we
selected the 9 most popular (technology, science, global issues, culture, design, business, entertainment,
health, innovation). Then, for the videos in each theme, we calculate the proportion of videos that were
ranked with each sentiment.
The area of the box in the treemap for each theme represents its proportion out of the total number of
videos we looked at. Each theme area has, nested inside of it, a box for each sentiment, with the size
representing the percentage of all votes that that sentiment received.
The order and size of the boxes are dependent on how many videos a theme are associated with it. For
example, 727 videos were categorized by TED as “technology” but only 229 were “innovation,” so they
are on opposite ends of the treemap and their areas are scaled to accommodate this.


**Color:** ​Rather than encoding theme by color, we encoded sentiments so that sentiments across themes
would be instantly recognizable. We delineated themes by borders (light gray instead of dark to avoid
luminance contrast effects) rather than color for this same reason. Color Scheme Set 3, from
d3-scale-chromatic has a low saturation level, which is good for encoding large areas. It also has the
benefits of a diverging color scale and lack of a hierarchy (Ware). We also took into consideration
color-blindness by exempting scales that included strong red/green distinctions (lecture).
**Labels:** ​We denoted the % of a sentiment and the total number of videos of a theme within each box so

### that viewers could ​ quantitatively ​compare the proportion of ratings or number of videos, respectively.

Keeping in mind the hierarchy of principles from the Ware reading - that area is more difficult to compare
than lines - we labeled the proportion on each box so that viewers wouldn’t be left guessing the relative
size of boxes.
**Treemap** ​: We chose a treemap since we could assign the data a hierarchy based on how many videos a
theme received, and since the information could be aggregated in those themes. We aggregated all the
videos by theme, and then aggregated the ratings according to sentiments. The themes are represented as
proportional to a total, which a treemap is good for because it compares areas. Padding was added to each
theme so that sentiments’ colors would not abut one another and to make themes as distinct from one
another as possible. The theme areas are still proportional to all the videos’ themes.
**Algebraic Vis:** ​Our visualization is invariant. If one were to shuffle our data’s rows, the data would look
the same: we calculate and filter the data of an individual row regardless of its location in the csv and
output it according to its proportion to the whole. It is also unambiguous. Changing the data - for
example, the counts of ‘inspiring’ votes a video received or associating more videos with ‘design’ - will
alter the sizes and order of the boxes representing each sentiment or theme. Likewise, if you change the
themes or sentiments depicted, the visualization will change as well.

## Alternatives and arbitrariness

We went through multiple iterations of how to represent this data. We first considered using
**radar graphs** ​, with each theme being an independent graph, and having each sentiment be an axis of the
graph. This would have introduced many hallucinators: based on which axis we placed a sentiment on, the
visualizations would have looked very different. Additionally, because different themes had significantly
different numbers of videos, we would have either had to change the scale between graphs, which would
violate the principle of using a common axis across the visualization, or use a very small area to represent
less common themes.

The second way we considered representing the data was through a ​ **sankey diagram** ​. This type
of diagram, however, would have implied a flow to the data, either across time or across classification.
We thought it best to avoid this implication, as, even though sankey diagrams can represent hierarchical
data, there are better ways to do so.

After deciding on using a treemap, we had to form a hierarchy from the data. The ordering of the
hierarchy first by theme then sentiment were deliberate decisions made in order to best answer the
questions we were asking. This ordering allows us to best address the questions, specifically regarding
which sentiments are most strongly evoked for a given theme ​ **(1)** ​, which is easiest to see when each
sentiment is represented for each theme. This hierarchy also allows us to answer question​ **(2)** ​ easily, since
the boxes representing different sentiments can easily be visually compared between themes. This is made
easier by using the same color for each sentiment throughout the diagram. Luckily our data proportions
are within a small range of each other (~3 to ~25%), otherwise aspect ratio would be very high and
therefore confusing.

Someone else could ask different questions about the data that would best be answered by a
different format of the visualization. If they were more concerned with individual sentiments, and the
relation of category to a given sentiment (such as if they were asking which themes are most closely
associated with each sentiment), they would possibly choose to switch the order of the hierarchy and first
group by sentiment, then theme.

One concern we had was comparing areas since the Ware reading clearly states the difficulty of
this. However, the treemap allowed for this because the areas are contained within one box and are
relative to one another. Nevertheless, we included padding of themes (so viewers can tell which
sentiments belong to which theme), the number of videos classified as each theme (so viewers can
understand the hierarchy of theme frequency), and a diverging color scale (a gradient would not only
imply hierarchy but would be difficult to distinguish different sentiments).
We acknowledge a point of arbitrariness in not representing all available sentiments. TED
provides viewers 14 total pre-set sentiments; we chose 6 of them. We acknowledge in our diagram that
the proportions visualized are not relative to all available sentiments and themes; this might be
misleading. For example, “Inspiring” is not 27.55% of all sentiments in Technology videos, just the six.
However, we wanted the proportions to add up to 100% to remain consistent with a treemap’s structure
and logical portions.

