const dynamyc = require('../middlewares/dynamiclink')


exports.TestDynamic = async(req,res)=>{

    let link = await  dynamyc.create('product', 1, 'share test', 'test share');
    if (link.error) {
       link.link = 'error'
    }

    return res.status(200).json({
        link : link.link
    });
}