const { json } = require("body-parser");

const dynamyc = require('../middlewares/dynamiclink')


exports.shareLink = async (req, res) => {

    try {
        param = req.body;
        var link = null;
        if(param.id2 !== undefined && param.id2 !== null)
        {
            
            link = await dynamyc.createMultipleId(param.type, param.id, param.id2, param.title, param.description);
            
        }
        else{
            link = await dynamyc.create(param.type, param.id, param.title, param.description);
        }
        
        if (link.error) {
            link.link = 'error'
        }
        return res.status(200).json({ link : link.link});
    } catch (error) {
        rtn.isSuccess = false;
        rtn.status = 200;
        rtn.message = "There Are somethign Wrong in Our System";
        
        return res.status(200).json(rtn);
    }



}