import {groupBy, mainTag, filterRatings, calculateProportions} from './utils';
import tape from "tape";

tape('ExampleTEst', t => {
	t.deepEquals(,mainTag(...), 'examples');
	t.end();
});

