import * as categoryService from "../services/category.service.js";

export async function listCategories(req, res, next) {
  try {
    const categories = await categoryService.listCategories();

    res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategory(req, res, next) {
  try {
    const category = await categoryService.getCategoryBySlug(req.params.slug);

    res.status(200).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req, res, next) {
  try {
    const category = await categoryService.createCategory(req.body, req.user);
    res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const category = await categoryService.updateCategory(
      req.params.categoryId,
      req.body,
      req.user,
    );

    res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const result = await categoryService.deleteCategory(
      req.params.categoryId,
      req.user,
    );
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}
