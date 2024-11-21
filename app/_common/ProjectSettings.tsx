"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { apiDelete } from "./api";
import { useRouter } from "next/navigation";
import { useSession } from "./SessionContext";

interface ProjectSettingsProps {
  projectId: string;
  initialName: string;
}

export default function ProjectSettings({
  projectId,
  initialName,
}: ProjectSettingsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { updateProjectName, deleteProject } = useSession();

  // Update local name when initialName changes
  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateProjectName(projectId, name);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update project name:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteProject(projectId);
      setIsOpen(false);
      router.push("/project");
    } catch (error) {
      console.error("Failed to delete project:", error);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  // Reset confirmation state when modal is closed
  const handleModalClose = () => {
    setIsOpen(false);
    setConfirmDelete(false);
  };

  return (
    <>
      <Button variant="light" onClick={() => setIsOpen(true)}>
        {initialName || "Unnamed Project"}
      </Button>

      <Modal isOpen={isOpen} onClose={handleModalClose}>
        <ModalContent>
          <ModalHeader>Project settings</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-small font-medium mb-1">
                  Project name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter project name"
                />
              </div>
              <div className="mt-4">
                <p className="text-small font-medium mb-1">Danger zone</p>
                <Button
                  color={"danger"}
                  onClick={() => {
                    if (confirmDelete) {
                      handleDelete();
                    } else {
                      setConfirmDelete(true);
                    }
                  }}
                  isLoading={isDeleting}
                >
                  {isDeleting
                    ? "Deleting..."
                    : confirmDelete
                      ? "Click again to confirm deletion"
                      : "Delete project"}
                </Button>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onClick={handleSave} isLoading={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
