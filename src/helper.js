import nifti from 'nifti-reader-js'
import nj from 'numjs'

export const data2numjs = function (data) {

    var niftiHeader = null,
        niftiImage = null,
        niftiExt = null;

    if (nifti.isCompressed(data)) {
        data = nifti.decompress(data);
    }

    if (nifti.isNIFTI(data)) {
        niftiHeader = nifti.readHeader(data);
        //console.log(niftiHeader.toFormattedString());
        niftiImage = nifti.readImage(niftiHeader, data);
        // convert raw data to typed array based on nifti datatype
        var typedData;

        if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT8) {
            typedData = new Uint8Array(niftiImage);
        } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT16) {
            typedData = new Int16Array(niftiImage);
        } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT32) {
            typedData = new Int32Array(niftiImage);
        } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT32) {
            typedData = new Float32Array(niftiImage);
        } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT64) {
            typedData = new Float64Array(niftiImage);
        } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT8) {
            typedData = new Int8Array(niftiImage);
        } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT16) {
            typedData = new Uint16Array(niftiImage);
        } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT32) {
            typedData = new Uint32Array(niftiImage);
        } else {
            return;
        }
        console.log(niftiHeader)

        if (nifti.hasExtension(niftiHeader)) {
            niftiExt = nifti.readExtensionData(niftiHeader, data);
        }

        var jsdata = nj.array([].slice.call(typedData)).reshape(182, 218, 182)
    }
    try {
        var metaInfo = JSON.parse(niftiHeader['description'])
    } catch (err) {
        var metaInfo = {}
    }

    // Hardcoded flip as define in the header
    jsdata = nj.flip(jsdata, 1)
    jsdata = nj.flip(jsdata, 0).clone()
    return [jsdata, metaInfo]
}
