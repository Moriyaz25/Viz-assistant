/**
 * Performs various join operations on two arrays of objects.
 */
export const performJoin = (leftData, rightData, leftKey, rightKey, type = 'inner') => {
    if (!leftData || !rightData) return [];

    let result = [];

    if (type === 'inner') {
        leftData.forEach(leftItem => {
            const matches = rightData.filter(rightItem => leftItem[leftKey] == rightItem[rightKey]);
            matches.forEach(match => {
                result.push({ ...leftItem, ...match });
            });
        });
    } else if (type === 'left') {
        leftData.forEach(leftItem => {
            const matches = rightData.filter(rightItem => leftItem[leftKey] == rightItem[rightKey]);
            if (matches.length > 0) {
                matches.forEach(match => {
                    result.push({ ...leftItem, ...match });
                });
            } else {
                result.push({ ...leftItem });
            }
        });
    } else if (type === 'right') {
        rightData.forEach(rightItem => {
            const matches = leftData.filter(leftItem => leftItem[leftKey] == rightItem[rightKey]);
            if (matches.length > 0) {
                matches.forEach(match => {
                    result.push({ ...match, ...rightItem });
                });
            } else {
                result.push({ ...rightItem });
            }
        });
    }

    return result;
};
