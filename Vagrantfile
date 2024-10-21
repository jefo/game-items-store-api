Vagrant.configure("2") do |config|
  # sudo systemctl enable --now libvirtd

  config.vm.provider :libvirt do |libvirt|
      libvirt.driver = "kvm"
      libvirt.memory = "4096"
      libvirt.cpus = "4"
  end

  config.vm.box = "cloud-image/ubuntu-22.04"
  
  config.vm.network "private_network", ip: "192.168.0.23"
  config.vm.network "forwarded_port", guest: 6379, host: 6379
  config.vm.network "forwarded_port", guest: 5432, host: 5432

  config.vm.synced_folder ".", "/home/vagrant/app", type: "nfs", nfs_udp: false

  config.vagrant.plugins = ["vagrant-docker-compose"]
  
  # RUNTIME
  config.vm.provision "shell", inline: <<-SHELL 
      apt-get update -y
      apt-get install unzip -y

      cd /home/vagrant
      curl -sL https://deb.nodesource.com/setup_20.x -o nodesource_setup.sh
      bash nodesource_setup.sh
      apt-get install nodejs
  SHELL

  $bun = <<-SCRIPT
      curl -fsSL https://bun.sh/install | bash
      source /home/vagrant/.bashrc
      ls /home/vagrant/.bun

      export MOON_INSTALL_DIR=/home/vagrant/.moon/bin
      curl -fsSL https://moonrepo.dev/install/moon.sh | bash
  SCRIPT

  config.vm.provision "shell", inline: $bun, privileged: false
  # config.vm.provision "shell", inline: $pm2, privileged: false

  # DATABASE
  config.vm.provision :docker
  config.vm.provision :docker_compose, yml: "/home/vagrant/app/docker-compose.yml", rebuild: true, run: "always"
end
