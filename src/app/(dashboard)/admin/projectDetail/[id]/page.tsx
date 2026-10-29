"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TaskTable from "@/app/components/project/taskTable";
import axios from "axios";
import { ProjectResponse } from "@/app/types/project";
import { MyProjectProfilesDetail } from "@/lib/hooks/useProjectManager";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
const ProjectDetailPage: React.FC = () => {
  const params = useParams();

  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();

  const { data: project, isLoading: isMicroTaskLoading } =
    MyProjectProfilesDetail({
      id,
    });

  if (isMicroTaskLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!project) return <div></div>;

  return (
    <div className="p-1">
      <TaskTable
        projectId={project.data.id}
        projectTitle={project.data.name}
        manager={project.data.manager}
        projectStatus={
          project.data.status === "active" || project.data.status === "Active"
            ? "Active"
            : "Inactive"
        }
        createdOn={project.data.start_date}
        lastUpdated={project.data.end_date}
        description={project.data.description}
        cover_image_url={project.data.cover_image_url}
        tags={project.data.tags ? project.data.tags.map((tag) => tag) : null}
      />
    </div>
  );
};

export default ProjectDetailPage;
