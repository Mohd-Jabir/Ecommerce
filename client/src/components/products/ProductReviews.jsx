import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProductReviews,
  createProductReview,
} from "../../api/product.api.js";

const formatDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const inputClass =
  "mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

export default function ProductReviews({ productId }) {
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [success, setSuccess] = useState("");
  const [formError, setFormError] = useState("");

  const reviewsQuery = useQuery({
    queryKey: ["products", productId, "reviews"],
    queryFn: () => getProductReviews(productId, { page: 1, limit: 10 }),
    enabled: Boolean(productId),
  });

  const reviewMutation = useMutation({
    mutationFn: (payload) => createProductReview(productId, payload),

    onSuccess: async () => {
      setTitle("");
      setComment("");
      setRating(5);
      setFormError("");
      setSuccess("Your review has been submitted and is awaiting approval.");

      await queryClient.invalidateQueries({
        queryKey: ["products", productId, "reviews"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },

    onError: (error) => {
      setSuccess("");
      setFormError(
        error?.response?.data?.message ||
          "Unable to submit your review. Please try again.",
      );
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    setSuccess("");
    setFormError("");

    if (!title.trim() && !comment.trim()) {
      setFormError("Please enter a review title or comment.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setFormError("Please select a rating from 1 to 5 stars.");
      return;
    }

    reviewMutation.mutate({
      rating,
      title: title.trim(),
      comment: comment.trim(),
    });
  };

  const data = reviewsQuery.data;
  const reviews = Array.isArray(data)
    ? data
    : data?.reviews || data?.data?.reviews || [];

  const pagination = data?.pagination || data?.data?.pagination;

  return (
    <section className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="text-2xl font-bold text-gray-900">Customer reviews</h2>

      {/* Review submission form */}
      <div className="mt-6 rounded-2xl border border-gray-200 p-5 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900">Write a review</h3>

        <p className="mt-1 text-sm text-gray-500">
          Share your experience with this product.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <fieldset>
            <legend className="text-sm font-medium text-gray-700">
              Your rating
            </legend>

            <div className="mt-2 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} out of 5 stars`}
                  aria-pressed={rating === star}
                  className={`text-3xl transition ${
                    star <= rating ? "text-amber-400" : "text-gray-300"
                  } hover:scale-110`}
                >
                  ★
                </button>
              ))}

              <span className="ml-2 text-sm text-gray-500">
                {rating} out of 5
              </span>
            </div>
          </fieldset>

          <label className="block text-sm font-medium text-gray-700">
            Review title
            <input
              className={inputClass}
              type="text"
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              placeholder="Summarize your experience"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Your review
            <textarea
              className={inputClass}
              name="comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength={3000}
              rows={4}
              placeholder="What did you like or dislike?"
            />
            <span className="mt-1 block text-right text-xs text-gray-400">
              {comment.length}/3000
            </span>
          </label>

          {formError && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {formError}
            </p>
          )}

          {success && (
            <p
              role="status"
              className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
            >
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={reviewMutation.isPending}
            className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {reviewMutation.isPending
              ? "Submitting review..."
              : "Submit review"}
          </button>

          <p className="text-xs leading-5 text-gray-500">
            Reviews are checked before they appear publicly. You must be logged
            in as a customer to submit a review.
          </p>
        </form>
      </div>

      {/* Existing approved reviews */}
      <div className="mt-8">
        {reviewsQuery.isPending ? (
          <p className="text-sm text-gray-500">Loading reviews...</p>
        ) : reviewsQuery.isError ? (
          <div>
            <p className="text-sm text-red-600">
              {reviewsQuery.error?.response?.data?.message ||
                "Unable to load reviews right now."}
            </p>

            <button
              type="button"
              onClick={() => reviewsQuery.refetch()}
              className="mt-2 text-sm font-medium text-indigo-600 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-gray-900">
              Customer feedback
            </h3>

            {reviews.length > 0 ? (
              <>
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-3xl font-bold text-gray-900">
                    {(
                      reviews.reduce(
                        (sum, review) => sum + Number(review.rating || 0),
                        0,
                      ) / reviews.length
                    ).toFixed(1)}
                  </span>

                  <div>
                    <p className="text-amber-500">
                      {"★".repeat(
                        Math.round(
                          reviews.reduce(
                            (sum, review) => sum + Number(review.rating || 0),
                            0,
                          ) / reviews.length,
                        ),
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      {pagination?.total ?? reviews.length} approved review
                      {(pagination?.total ?? reviews.length) !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="mt-6 divide-y divide-gray-200">
                  {reviews.map((review) => {
                    const stars = Math.max(
                      0,
                      Math.min(5, Number(review.rating) || 0),
                    );

                    return (
                      <article key={review._id} className="py-5 first:pt-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold text-gray-900">
                            {review.user?.name ||
                              review.user?.fullName ||
                              "Customer"}
                          </p>

                          <time className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </time>
                        </div>

                        <p
                          className="mt-2 text-amber-500"
                          aria-label={`${stars} out of 5 stars`}
                        >
                          {"★".repeat(stars)}
                          {"☆".repeat(5 - stars)}
                        </p>

                        {review.title && (
                          <h4 className="mt-2 font-medium text-gray-900">
                            {review.title}
                          </h4>
                        )}

                        <p className="mt-2 whitespace-pre-line leading-7 text-gray-600">
                          {review.comment || "No written comment."}
                        </p>
                      </article>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-gray-300 p-6 text-sm text-gray-500">
                No approved reviews yet. Be the first to share your experience!
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
