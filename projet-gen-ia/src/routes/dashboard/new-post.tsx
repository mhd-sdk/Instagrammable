import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { NewPostForm, type NewPostFormData } from "~/components/new-post";
import { createImagePostFn } from "~/fn/image-posts";

export const Route = createFileRoute("/dashboard/new-post")({
  component: NewPostPage,
});

function NewPostPage() {
  const navigate = useNavigate();

  const handleSubmit = async (data: NewPostFormData) => {
    const result = await createImagePostFn({
      data: {
        title: data.title || undefined,
        imageUrl: data.imageUrl,
        prompt: data.prompt,
        status: "draft",
      },
    });

    // Navigate to dashboard after successful creation
    navigate({ to: "/dashboard" });

    return result;
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <NewPostForm onSubmit={handleSubmit} />
    </div>
  );
}
