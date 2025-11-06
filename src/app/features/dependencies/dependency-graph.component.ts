import { Component, OnInit, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { DependencyService } from '../../core/services/dependency.service';

interface D3Node {
  id: number;
  name: string;
  criticality: string;
  techStack: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface D3Link {
  source: number | D3Node;
  target: number | D3Node;
  type: string;
  criticality: number;
}

@Component({
  selector: 'app-dependency-graph',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dependency-graph.component.html',
  styleUrls: ['./dependency-graph.component.scss']
})
export class DependencyGraphComponent implements OnInit {
  @ViewChild('graphContainer') graphContainer!: ElementRef;
  
  loading = signal<boolean>(true);
  error = signal<string>('');
  showLegend = signal<boolean>(true);
  zoomLevel = signal<number>(100);
  selectedNode = signal<D3Node | null>(null);
  
  private svg: any;
  private simulation: any;
  private g: any;
  private zoom: any;
  private width = 1200;
  private height = 700;

  constructor(private dependencyService: DependencyService) {}

  ngOnInit(): void {
    this.loadDependencyGraph();
  }

  loadDependencyGraph(): void {
    this.dependencyService.getDependencyGraph().subscribe({
      next: (graph) => {
        setTimeout(() => this.createDependencyGraph(graph), 100);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Failed to load dependency graph. Please try again.');
        this.loading.set(false);
      }
    });
  }

  private createDependencyGraph(data: any): void {
    // Clear previous SVG
    d3.select(this.graphContainer.nativeElement).selectAll('svg').remove();

    // Create SVG
    this.svg = d3.select(this.graphContainer.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('class', 'graph-svg');

    // Add zoom behavior
    this.zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
        this.zoomLevel.set(Math.round(event.transform.k * 100));
      });

    this.svg.call(this.zoom);

    // Group for transformations
    this.g = this.svg.append('g');

    // Create force simulation
    this.simulation = d3.forceSimulation(data.nodes as D3Node[])
      .force('link', d3.forceLink(data.links as D3Link[])
        .id((d: any) => d.id)
        .distance(150)
        .strength(0.5))
      .force('charge', d3.forceManyBody().strength(-800))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('collide', d3.forceCollide().radius(50));

    // Draw links first (so they appear behind nodes)
    const link = this.g.append('g')
      .selectAll('line')
      .data(data.links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', (d: any) => this.getLinkColor(d.criticality))
      .attr('stroke-width', (d: any) => this.getLinkWidth(d.criticality))
      .attr('opacity', 0.6);

    // Add link labels (dependency type)
    const linkLabels = this.g.append('g')
      .selectAll('text')
      .data(data.links)
      .enter()
      .append('text')
      .attr('class', 'link-label')
      .attr('font-size', 11)
      .attr('fill', '#666')
      .attr('text-anchor', 'middle')
      .text((d: any) => d.type);

    // Draw nodes
    const node = this.g.append('g')
      .selectAll('circle')
      .data(data.nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', 20)
      .attr('fill', (d: any) => this.getNodeColor(d.criticality))
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .call(this.drag(this.simulation))
      .on('click', (event: any, d: any) => {
        this.selectedNode.set(d);
      })
      .on('mouseover', (event: any, d: any) => {
        this.onNodeHover(d, data.nodes);
      })
      .on('mouseout', () => {
        this.onNodeHoverOut(node);
      });

    // Add labels
    const labels = this.g.append('g')
      .selectAll('text')
      .data(data.nodes)
      .enter()
      .append('text')
      .attr('class', 'node-label')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('font-size', 12)
      .attr('font-weight', 600)
      .attr('fill', '#fff')
      .attr('pointer-events', 'none')
      .text((d: any) => d.name.substring(0, 15));

    // Add titles (tooltips)
    node.append('title')
      .text((d: any) => `${d.name}\n${d.criticality}\n${d.techStack}`);

    // Update positions on tick
    this.simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      linkLabels
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2);

      node
        .attr('cx', (d: any) => d.x = Math.max(25, Math.min(this.width - 25, d.x)))
        .attr('cy', (d: any) => d.y = Math.max(25, Math.min(this.height - 25, d.y)));

      labels
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });
  }

  private getNodeColor(criticality: string): string {
    switch (criticality) {
      case 'CRITICAL':
        return '#dc3545';
      case 'HIGH':
        return '#fd7e14';
      case 'MEDIUM':
        return '#ffc107';
      case 'LOW':
        return '#28a745';
      default:
        return '#6c757d';
    }
  }

  private getLinkColor(criticality: number): string {
    if (criticality >= 80) return '#dc3545';
    if (criticality >= 60) return '#fd7e14';
    if (criticality >= 40) return '#ffc107';
    return '#28a745';
  }

  private getLinkWidth(criticality: number): number {
    if (criticality >= 80) return 3;
    if (criticality >= 60) return 2.5;
    if (criticality >= 40) return 2;
    return 1.5;
  }

  private drag(simulation: any) {
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  private onNodeHover(hoveredNode: D3Node, allNodes: D3Node[]): void {
    // Dim non-connected nodes
    d3.selectAll('.node')
      .attr('opacity', (d: any) => {
        return d.id === hoveredNode.id ? 1 : 0.3;
      });

    d3.selectAll('.node-label')
      .attr('opacity', (d: any) => {
        return d.id === hoveredNode.id ? 1 : 0.3;
      });

    d3.selectAll('.link')
      .attr('opacity', (d: any) => {
        return (d.source.id === hoveredNode.id || d.target.id === hoveredNode.id) ? 0.8 : 0.1;
      });
  }

  private onNodeHoverOut(node: any): void {
    d3.selectAll('.node').attr('opacity', 1);
    d3.selectAll('.node-label').attr('opacity', 1);
    d3.selectAll('.link').attr('opacity', 0.6);
  }

  resetZoom(): void {
    this.svg.transition()
      .duration(750)
      .call(this.zoom.transform, d3.zoomIdentity
        .translate(0, 0)
        .scale(1));
  }

  toggleLegend(): void {
    this.showLegend.set(!this.showLegend());
  }

  getNodeStats(criticality: string): string {
    const counts: any = {
      'CRITICAL': 0,
      'HIGH': 0,
      'MEDIUM': 0,
      'LOW': 0
    };
    return counts[criticality] || 0;
  }
}
