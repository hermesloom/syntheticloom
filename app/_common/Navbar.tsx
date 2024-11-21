"use client";

import {
  Navbar as NextUINavbar,
  NavbarBrand,
  NavbarContent,
  Avatar,
  Button,
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { useSession } from "./SessionContext";
import Account from "./Account";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProjectSettings from "./ProjectSettings";

export default function Navbar({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { session, profile, updateProfile, createProject } = useSession();
  const [projectName, setProjectName] = useState("");
  const {
    isOpen: isAccountOpen,
    onOpen: onAccountOpen,
    onClose: onAccountClose,
  } = useDisclosure();
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [creatingNewProject, setCreatingNewProject] = useState(false);

  // Find current project and set initial name
  useEffect(() => {
    const project = profile?.projects.find((p) => p.id === projectId);
    if (project) {
      setProjectName(project.name);
    }
  }, [profile, projectId]);

  const navigateToProject = (id: string) => {
    router.push(`/project/${id}`);
  };

  const createNewProject = async () => {
    try {
      setCreatingNewProject(true);
      const newProject = await createProject();
      setCreatingNewProject(false);
      router.push(`/project/${newProject.id}`);
    } catch (error) {
      console.error("Failed to create new project:", error);
    }
  };

  return (
    <>
      <NextUINavbar className="border-b w-full h-12" maxWidth="full">
        <NavbarBrand className="gap-4">
          <p className="font-bold text-l">Synthetic Loom</p>
          {profile && (
            <>
              <Button
                color="primary"
                size="sm"
                onClick={createNewProject}
                isLoading={creatingNewProject}
              >
                New project
              </Button>
              <Dropdown
                isOpen={isProjectsOpen}
                onOpenChange={setIsProjectsOpen}
              >
                <DropdownTrigger>
                  <Button
                    variant="light"
                    size="sm"
                    onMouseEnter={() => {
                      setIsProjectsOpen(true);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    Projects
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Projects"
                  onAction={(key) => navigateToProject(key as string)}
                  selectedKeys={new Set([projectId])}
                  selectionMode="single"
                >
                  {profile.projects.map((project) => (
                    <DropdownItem
                      key={project.id}
                      className="data-[selected=true]:bg-primary-100"
                    >
                      {project.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </>
          )}
        </NavbarBrand>

        {profile ? (
          <NavbarContent justify="center">
            <ProjectSettings projectId={projectId} initialName={projectName} />
          </NavbarContent>
        ) : null}

        <NavbarContent justify="end">
          {session ? (
            <Button isIconOnly variant="light" onClick={onAccountOpen}>
              <Avatar
                size="sm"
                showFallback
                name={session.user.email?.[0].toUpperCase()}
              />
            </Button>
          ) : null}
        </NavbarContent>
      </NextUINavbar>

      <Modal
        isOpen={isAccountOpen}
        onClose={onAccountClose}
        size="2xl"
        classNames={{
          base: "m-0",
          wrapper: "items-center",
        }}
      >
        <ModalContent className="m-4">
          <ModalBody>
            <Account />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
