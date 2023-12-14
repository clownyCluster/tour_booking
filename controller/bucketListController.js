const fs = require('fs');

const bucketList = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/bucketList.json`)
);

exports.checkId = (req, res, next, val) => {
  console.log(`This is the id: ${val}`);
  if (req.params.id * 1 > bucketList.length) {
    return res.status(404).json({
      status: 'failed',
      message: 'Invalid Id',
    });
  }
  next();
};

exports.getBucketList = (req, res) => {
  res.status(200).send({
    status: 'success',
    data: {
      message: 'Fetch successful',
      bucketList: {
        bucketList,
      },
    },
  });
};

exports.createBucketList = (req, res) => {
  res.status(201).send({
    status: 'success',
    data: req.body,
  });
};

exports.getBucketListById = (req, res) => {
  const id = req.params.id * 1;

  const singleBucketList = bucketList.find((el) => el.id === id);

  //   if (!singleBucketList) {
  //     return res.status(404).send({
  //       status: 'fail',
  //       message: 'Invalid Id',
  //     });
  //   }
  res.status(200).send({
    status: 'success',
    message: 'THis is the get req with id',
    data: {
      singleBucketList,
    },
  });
};

exports.searchBucketList = (req, res) => {
  const query = req.query.country;
  console.log(query);

  const searchedList = bucketList.find((el) => el.country === query);

  if (!searchedList) {
    return res.status(404).send({
      status: 'fail',
      message: 'Country not found in the bucket list.',
    });
  }

  res.status(200).send({
    status: 'success',
    data: {
      searchedList,
    },
  });
};

// exports.searchBucketList = (req, res) => {
//   const countryToSearch = req.query.search;

//   // Add your logic to search by country using countryToSearch

//   const searchedList = bucketList.find((el) => el.country === countryToSearch);

//   if (!searchedList) {
//     return res.status(404).send({
//       status: 'fail',
//       message: 'Country not found in the bucket list.',
//     });
//   }

//   res.status(200).send({
//     status: 'success',
//     data: {
//       searchedList,
//     },
//   });
// };

exports.updateBucketList = (req, res) => {
  res.status(203).send({
    status: 'success',
    data: 'Update successful',
  });
};

exports.deleteBucketList = (req, res) => {
  res.status(204).send({
    status: 'success',
    data: 'Deletion success',
  });
};
