import Category from "./../models/category.js";

export const getChildren = async (req, res, next) => {
  const id = req.params.id;
  const categories = await Category.find({ parent_category: id }).populate("brands");

  res.status(200).json({
    status: "success",
    data: categories,
  });
};

export const getProps = async (req, res, next) => {
  const id = req.params.id;
  let list = [];
  list = await getParentProps(id, list);
  res.status(200).json({
    status: "success",
    data: list,
  });
};

async function getParentProps(id, props) {
  const category = await Category.findById(id).populate({
    path: "props",
    model: "prop",
  });
  props.push(...category.props);
  if (category.parent_category) {
    return getParentProps(category.parent_category, props);
  }
  return props;
}
