const TransferService = require('../../services/TransferService');
const {
  transferGetQuerySchema,
  transferLimitOffsetQuerySchema,
  transferIdFulfillSchema,
  transferIdParamSchema,
  transferPostSchema,
} = require('./schemas');

const transferPost = async (req, res) => {
  const validatedData = await transferPostSchema.validateAsync(req.body, { abortEarly: false });
  const transferService = new TransferService();

  const { result, status } = await transferService.initiateTransfer(
    validatedData,
    req.wallet_id,
  );

  const modifiedTransfer = {
    ...result,
    token_count:
        +result.parameters?.bundle?.bundleSize || +result.parameters?.tokens?.length,
  }

  res.status(status).send(modifiedTransfer);
};

const transferIdAcceptPost = async (req, res) => {
  await transferIdParamSchema.validateAsync(req.params, { abortEarly: false });

  const transferService = new TransferService();
  const result = await transferService.acceptTransfer(
    req.params.transfer_id,
    req.wallet_id,
  );

  res.json(result);
};

const transferIdDeclinePost = async (req, res) => {
  await transferIdParamSchema.validateAsync(req.params, { abortEarly: false });

  const transferService = new TransferService();
  const result = await transferService.declineTransfer(
    req.params.transfer_id,
    req.wallet_id,
  );

  res.json(result);
};

const transferIdDelete = async (req, res) => {
  await transferIdParamSchema.validateAsync(req.params, { abortEarly: false });

  const transferService = new TransferService();
  const result = await transferService.cancelTransfer(
    req.params.transfer_id,
    req.wallet_id,
  );

  res.json(result);
};

const transferIdFulfill = async (req, res) => {
  await transferIdParamSchema.validateAsync(req.params, { abortEarly: false });
  await transferIdFulfillSchema.validateAsync(req.body, { abortEarly: false });

  const transferService = new TransferService();

  const result = await transferService.fulfillTransfer(
    req.wallet_id,
    req.params.transfer_id,
    req.body,
  );
  res.json(result);
};

const transferGet = async (req, res) => {
  await transferGetQuerySchema.validateAsync(req.query, { abortEarly: false });

  const transferService = new TransferService();

  const { limit = 200, offset = 0, ...params } = req.query;

  const {transfers, count} = await transferService.getByFilter({...params, limit, offset}, req.wallet_id);

  const modifiedTransfers = transfers.map((t) => ({
    ...t,
    token_count:
      +t.parameters?.bundle?.bundleSize || +t.parameters?.tokens?.length,
  }));

  res.status(200).json({ transfers: modifiedTransfers, query: {...params, limit, offset}, total:count });
};

const transferIdGet = async (req, res) => {
  await transferIdParamSchema.validateAsync(req.params, { abortEarly: false });

  const transferService = new TransferService();
  const result = await transferService.getTransferById(
    req.params.transfer_id,
    req.wallet_id,
  );

  const modifiedTransfer = {
    ...result,
    token_count:
        +result.parameters?.bundle?.bundleSize || +result.parameters?.tokens?.length,
  }

  res.json(modifiedTransfer);
};

const transferIdTokenGet = async (req, res) => {
  await transferIdParamSchema.validateAsync(req.params, { abortEarly: false });
  await transferLimitOffsetQuerySchema.validateAsync(req.query, {
    abortEarly: false,
  });

  const { limit, offset } = req.query;

  const transferService = new TransferService();
  const tokens = await transferService.getTokensByTransferId(
    req.params.transfer_id, req.wallet_id,
    limit,
    offset,
  );

  res.json({ tokens });
};

module.exports = {
  transferGet,
  transferIdAcceptPost,
  transferIdDeclinePost,
  transferIdDelete,
  transferIdFulfill,
  transferIdGet,
  transferIdTokenGet,
  transferPost,
};
